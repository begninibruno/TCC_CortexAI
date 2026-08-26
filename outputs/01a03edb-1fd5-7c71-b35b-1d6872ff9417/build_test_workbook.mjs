import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const outputDir = 'C:/Users/Renan Denis/Desktop/cortexai/TCC_CortexAI/outputs/01a03edb-1fd5-7c71-b35b-1d6872ff9417';
const outputPath = `${outputDir}/produtos_teste_importacao.xlsx`;

const workbook = Workbook.create();
const products = workbook.worksheets.add('Produtos para importar');
const instructions = workbook.worksheets.add('LEIA-ME');

const headers = [
  'Nome do produto', 'Descrição', 'Preço de venda', 'Preço de custo', 'Estoque atual',
  'Estoque mínimo', 'Unidade de medida', 'Categoria', 'SKU / código interno',
  'Código de barras / EAN', 'Fornecedor', 'Validade', 'Lote / série', 'Localização',
  'Link do produto', 'Status', 'Tags', 'Marca (extra)', 'NCM (extra)', 'Origem do cadastro (extra)'
];

const rows = [
  ['Café Torrado 500g', 'Café torrado e moído, pacote de 500 g', 18.90, 12.40, 35, 8, 'unidade', 'Alimentos', 'CAF-500-001', '7891000000011', 'Distribuidora Aurora', new Date('2027-02-15T12:00:00Z'), 'LT-CAFE-2702', 'A1 / Prateleira 2', 'https://example.com/produtos/cafe-500g', 'ativo', 'café, mercearia, manhã', 'Serra Azul', '09012100', 'PDV Loja Centro'],
  ['Arroz Tipo 1 5kg', 'Arroz branco tipo 1 em pacote de 5 kg', 32.50, 25.80, 28, 6, 'unidade', 'Alimentos', 'ARR-5KG-002', '7891000000028', 'Atacado Bom Preço', new Date('2027-05-30T12:00:00Z'), 'LT-ARR-0527', 'A2 / Prateleira 1', 'https://example.com/produtos/arroz-5kg', 'ativo', 'arroz, cesta básica', 'Campo Nobre', '10063021', 'ERP Matriz'],
  ['Suco de Uva 1L', 'Suco integral de uva em garrafa de 1 litro', 14.75, 9.20, 42, 10, 'litro', 'Bebidas', 'SUC-UVA-1L', '7891000000035', 'Bebidas Vale Verde', new Date('2027-01-20T12:00:00Z'), 'LT-SUCO-0127', 'B1 / Prateleira 3', 'https://example.com/produtos/suco-uva-1l', 'ativo', 'suco, integral, uva', 'Vale Verde', '20096100', 'Loja virtual'],
  ['Água Mineral 1,5L', 'Água mineral sem gás, garrafa de 1,5 litro', 4.50, 2.10, 96, 24, 'unidade', 'Bebidas', 'AGU-15L-004', '7891000000042', 'Fonte Cristalina', new Date('2027-08-10T12:00:00Z'), 'LT-AGUA-0827', 'B2 / Palete 1', 'https://example.com/produtos/agua-15l', 'ativo', 'água, sem gás', 'Cristalina', '22011000', 'PDV Loja Norte'],
  ['Detergente Neutro 500ml', 'Detergente líquido neutro para louças', 3.99, 2.15, 60, 15, 'unidade', 'Limpeza', 'DET-NEU-500', '7891000000059', 'Higiene & Cia', new Date('2028-03-01T12:00:00Z'), 'LT-DET-0328', 'C1 / Prateleira 4', 'https://example.com/produtos/detergente-neutro', 'ativo', 'limpeza, cozinha, neutro', 'Casa Clara', '34025000', 'ERP Matriz'],
  ['Papel Toalha 2 Rolos', 'Pacote com dois rolos de papel toalha', 8.49, 5.30, 31, 8, 'kit', 'Limpeza', 'PAP-T-2R-006', '7891000000066', 'Papelaria Nacional', null, 'LT-PAP-2026', 'C2 / Prateleira 2', 'https://example.com/produtos/papel-toalha', 'ativo', 'papel, limpeza, cozinha', 'Folha Leve', '48189090', 'Importação CSV'],
  ['Caderno Universitário', 'Caderno de 10 matérias com 200 folhas', 24.90, 16.00, 22, 5, 'unidade', 'Papelaria', 'CAD-10M-007', '7891000000073', 'Papel & Arte', null, 'LT-CAD-0826', 'D1 / Prateleira 1', 'https://example.com/produtos/caderno-universitario', 'ativo', 'caderno, escola, escritório', 'Escreve Bem', '48202000', 'Planilha fornecedor'],
  ['Caneta Esferográfica Azul', 'Caneta azul com ponta média de 1,0 mm', 2.75, 1.10, 120, 30, 'unidade', 'Papelaria', 'CAN-AZ-008', '7891000000080', 'Papel & Arte', null, 'LT-CAN-2026', 'D1 / Gaveta 3', 'https://example.com/produtos/caneta-azul', 'ativo', 'caneta, azul, escritório', 'Linha Certa', '96081000', 'Planilha fornecedor'],
  ['Lâmpada LED 9W', 'Lâmpada LED branca bivolt, potência de 9 W', 11.90, 7.45, 18, 6, 'unidade', 'Eletrônicos', 'LED-9W-009', '7891000000097', 'Elétrica Brasil', null, 'LT-LED-0926', 'E1 / Prateleira 2', 'https://example.com/produtos/lampada-led-9w', 'ativo', 'led, iluminação, bivolt', 'Luz Mais', '85395200', 'Loja virtual'],
  ['Cabo USB-C 1m', 'Cabo USB-C reforçado com um metro', 19.99, 10.50, 25, 7, 'unidade', 'Eletrônicos', 'CAB-USBC-010', '7891000000103', 'Tech Distribuição', null, 'LT-CAB-1026', 'E2 / Gaveta 1', 'https://example.com/produtos/cabo-usbc-1m', 'ativo', 'cabo, usb-c, acessório', 'Conecta', '85444200', 'Marketplace'],
  ['Pão de Queijo Congelado', 'Pão de queijo congelado vendido por quilograma', 29.90, 18.60, 12.5, 3, 'kg', 'Congelados', 'PDQ-KG-011', '7891000000110', 'Sabor da Serra', new Date('2026-12-18T12:00:00Z'), 'LT-PDQ-1226', 'Freezer F1', 'https://example.com/produtos/pao-queijo-kg', 'ativo', 'congelado, pão de queijo', 'Sabor da Serra', '19012000', 'PDV Loja Centro'],
  ['Kit Organização 3 Peças', 'Conjunto com três caixas organizadoras', 39.90, 24.75, 14, 4, 'kit', 'Utilidades', 'KIT-ORG-012', '7891000000127', 'Utilidades Horizonte', null, 'LT-ORG-2026', 'F1 / Prateleira 1', 'https://example.com/produtos/kit-organizacao', 'inativo', 'organização, casa, caixas', 'Lar Prático', '39249000', 'ERP Matriz']
];

rows.forEach((row) => { row[9] = Number(row[9]); });

products.getRange('A1:T13').values = [headers, ...rows];
products.showGridLines = false;
products.freezePanes.freezeRows(1);

const header = products.getRange('A1:T1');
header.format = {
  fill: '#1D4ED8',
  font: { bold: true, color: '#FFFFFF', size: 10 },
  verticalAlignment: 'center',
  wrapText: true,
  borders: { preset: 'outside', style: 'thin', color: '#1E3A8A' },
};
header.format.rowHeight = 42;

const body = products.getRange('A2:T13');
body.format = {
  font: { color: '#1E293B', size: 10 },
  verticalAlignment: 'center',
  borders: { insideHorizontal: { style: 'thin', color: '#E2E8F0' } },
};
body.format.rowHeight = 28;

products.getRange('C2:D13').format.numberFormat = 'R$ #,##0.00';
products.getRange('E2:F13').format.numberFormat = '#,##0.###';
products.getRange('J2:J13').format.numberFormat = '0';
products.getRange('L2:L13').format.numberFormat = 'dd/mm/yyyy';
products.getRange('Q2:Q13').format.wrapText = true;

const widths = [24, 36, 15, 15, 14, 14, 16, 17, 20, 22, 23, 14, 17, 20, 45, 12, 27, 18, 16, 24];
widths.forEach((width, index) => {
  products.getRangeByIndexes(0, index, 13, 1).format.columnWidth = width;
});

products.getRange('G2:G100').dataValidation = { rule: { type: 'list', values: ['unidade', 'kg', 'litro', 'kit'] } };
products.getRange('P2:P100').dataValidation = { rule: { type: 'list', values: ['ativo', 'inativo', 'descontinuado'] } };
products.getRange('P2:P100').conditionalFormats.add('containsText', {
  text: 'inativo',
  format: { fill: '#FEF3C7', font: { color: '#92400E', bold: true } },
});

const table = products.tables.add('A1:T13', true, 'ProdutosTesteImportacao');
table.style = 'TableStyleMedium2';
table.showFilterButton = true;
table.showBandedRows = true;

instructions.showGridLines = false;
instructions.getRange('A1').values = [['Como testar a importação de produtos']];
instructions.getRange('A1:F1').merge();
instructions.getRange('A1:F1').format = {
  fill: '#1D4ED8',
  font: { bold: true, color: '#FFFFFF', size: 18 },
  verticalAlignment: 'center',
};
instructions.getRange('A1:F1').format.rowHeight = 42;

instructions.getRange('A3:B9').values = [
  ['Passo', 'O que fazer'],
  ['1', 'No site, abra Dashboard > Produtos.'],
  ['2', 'Clique em “Importar planilha”.'],
  ['3', 'Selecione este mesmo arquivo .xlsx.'],
  ['4', 'Confira se as colunas foram reconhecidas automaticamente.'],
  ['5', 'Mantenha “Criar categorias automaticamente” marcado.'],
  ['6', 'Revise a prévia e clique em “Importar”.'],
];
instructions.getRange('A3:B3').format = {
  fill: '#DBEAFE',
  font: { bold: true, color: '#1E3A8A' },
  borders: { preset: 'outside', style: 'thin', color: '#93C5FD' },
};
instructions.getRange('A4:B9').format = {
  font: { color: '#334155', size: 11 },
  borders: { insideHorizontal: { style: 'thin', color: '#E2E8F0' } },
  verticalAlignment: 'center',
};
instructions.getRange('A4:A9').format = { fill: '#EFF6FF', font: { bold: true, color: '#2563EB' }, horizontalAlignment: 'center' };
instructions.getRange('A3:A9').format.columnWidth = 10;
instructions.getRange('B3:B9').format.columnWidth = 70;
instructions.getRange('A4:B9').format.rowHeight = 29;

instructions.getRange('A11').values = [['O que esta planilha testa']];
instructions.getRange('A11:F11').merge();
instructions.getRange('A11:F11').format = { fill: '#E0E7FF', font: { bold: true, color: '#3730A3', size: 13 } };
instructions.getRange('A13:B18').values = [
  ['Recurso', 'Exemplo incluído'],
  ['Categorias', 'Alimentos, Bebidas, Limpeza, Papelaria, Eletrônicos, Congelados e Utilidades'],
  ['Valores', 'Preços, custos, estoques inteiros e fracionados'],
  ['Identificação', 'SKU e código de barras diferentes para cada produto'],
  ['Campos avançados', 'Fornecedor, validade, lote, localização, link, status e tags'],
  ['Dados extras', 'Marca, NCM e origem do cadastro devem ser preservados como dados adicionais'],
];
instructions.getRange('A13:B13').format = { fill: '#DBEAFE', font: { bold: true, color: '#1E3A8A' } };
instructions.getRange('A14:B18').format = { borders: { insideHorizontal: { style: 'thin', color: '#E2E8F0' } }, font: { color: '#334155', size: 11 }, verticalAlignment: 'center' };
instructions.getRange('A13:A18').format.columnWidth = 24;
instructions.getRange('B13:B18').format.columnWidth = 70;
instructions.getRange('A14:B18').format.rowHeight = 30;

await fs.mkdir(outputDir, { recursive: true });

const productsPreview = await workbook.render({
  sheetName: 'Produtos para importar',
  range: 'A1:J13',
  scale: 1.2,
  format: 'png',
});
await fs.writeFile(`${outputDir}/preview_produtos.png`, new Uint8Array(await productsPreview.arrayBuffer()));

const productsRightPreview = await workbook.render({
  sheetName: 'Produtos para importar',
  range: 'K1:T13',
  scale: 1.2,
  format: 'png',
});
await fs.writeFile(`${outputDir}/preview_produtos_direita.png`, new Uint8Array(await productsRightPreview.arrayBuffer()));

const instructionsPreview = await workbook.render({
  sheetName: 'LEIA-ME',
  range: 'A1:F18',
  scale: 1.5,
  format: 'png',
});
await fs.writeFile(`${outputDir}/preview_instrucoes.png`, new Uint8Array(await instructionsPreview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const check = await workbook.inspect({
  kind: 'table',
  range: 'Produtos para importar!A1:T13',
  include: 'values,formulas',
  tableMaxRows: 14,
  tableMaxCols: 20,
  maxChars: 12000,
});
console.log(check.ndjson);

const errors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',
  options: { useRegex: true, maxResults: 100 },
  summary: 'final formula error scan',
});
console.log(errors.ndjson);
console.log(`OUTPUT=${outputPath}`);
