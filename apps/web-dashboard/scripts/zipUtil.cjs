/**
 * Criador de ZIP nativo em Node, sem dependências externas e sem chamar
 * `Compress-Archive` do PowerShell.
 *
 * Motivo de existir (bug real, 30/08/2026): o zip gerado pelo
 * `Compress-Archive` do Windows PowerShell grava metadado de origem
 * Windows/FAT no cabeçalho de cada entrada ("version made by"). O parser
 * de zip da Netlify, ao ver esse metadado, **reinterpreta o separador de
 * pasta como barra invertida** mesmo com os nomes internos gravados
 * corretamente com `/` — resultado: toda a estrutura de pastas do site
 * (`_astro/`, `images/`, cada página de bairro/serviço) virava um nome de
 * arquivo achatado com `\` literal no meio, e só o `index.html` da raiz
 * funcionava. Confirmado isolando o teste: o mesmo `dist/` compactado com
 * Python (metadado Unix) foi interpretado certo pela Netlify.
 *
 * Este módulo grava cada entrada com metadado Unix (`versionMadeBy` =
 * 3 << 8, "Unix") e caminho sempre com `/`, removendo a dependência do
 * PowerShell nesse passo — funciona igual em qualquer SO.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function dosDateTime(date) {
  const time = ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((date.getSeconds() >> 1) & 0x1f);
  const dosDate = (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0xf) << 5) | (date.getDate() & 0x1f);
  return { time, date: dosDate };
}

function listFilesRecursive(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full, base));
    } else if (entry.isFile()) {
      const rel = path.relative(base, full).split(path.sep).join('/');
      out.push({ full, rel });
    }
  }
  return out;
}

/** Compacta todo o conteúdo de `srcDir` num zip em `destZipPath`. */
function zipDirectory(srcDir, destZipPath) {
  const files = listFilesRecursive(srcDir);
  const { time, date } = dosDateTime(new Date());
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const { full, rel } of files) {
    const data = fs.readFileSync(full);
    const crc = zlib.crc32(data);
    const compressed = zlib.deflateRawSync(data);
    const useCompression = compressed.length < data.length;
    const method = useCompression ? 8 : 0; // 8 = deflate, 0 = store
    const payload = useCompression ? compressed : data;
    const nameBuf = Buffer.from(rel, 'utf8');

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0, 6); // flags
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(date, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(payload.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra field length

    localChunks.push(localHeader, nameBuf, payload);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE((3 << 8) | 20, 4); // version made by: Unix (3) + spec 2.0
    centralHeader.writeUInt16LE(20, 6); // version needed
    centralHeader.writeUInt16LE(0, 8); // flags
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(date, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(payload.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // extra field length
    centralHeader.writeUInt16LE(0, 32); // comment length
    centralHeader.writeUInt16LE(0, 34); // disk number start
    centralHeader.writeUInt16LE(0, 36); // internal file attributes
    // external file attributes: unix permissions (0644 pra arquivo normal) no high word
    // (>>> 0 pra converter pra unsigned — << em JS opera em int32 assinado)
    centralHeader.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralChunks.push(centralHeader, nameBuf);

    offset += localHeader.length + nameBuf.length + payload.length;
  }

  const centralDirStart = offset;
  const centralDirBuffer = Buffer.concat(centralChunks);

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4); // disk number
  end.writeUInt16LE(0, 6); // disk with central dir
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirBuffer.length, 12);
  end.writeUInt32LE(centralDirStart, 16);
  end.writeUInt16LE(0, 20); // comment length

  const finalBuffer = Buffer.concat([...localChunks, centralDirBuffer, end]);
  fs.writeFileSync(destZipPath, finalBuffer);
  return { fileCount: files.length, zipSize: finalBuffer.length };
}

module.exports = { zipDirectory };
