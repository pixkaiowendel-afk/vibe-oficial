export interface Sticker {
  name: string;
  url: string;
}

export const ORIGINAL_STICKERS: Sticker[] = [
  { name: 'Te Amo! ❤️', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&q=80' },
  { name: 'Amor no Espelho 💖', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=200&q=80' },
  { name: 'Vela Romântica 🕯️', url: 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=200&q=80' },
  { name: 'Rosa de Paixão 🌹', url: 'https://images.unsplash.com/photo-1494972308805-463bc619b34e?w=200&q=80' },
  { name: 'Bokeh de Amor ✨', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&q=80' },
  { name: 'Mãos Dadas 🤝', url: 'https://images.unsplash.com/photo-1501901609772-df0848060b33?w=200&q=80' },
  { name: 'Fagulhas de Amor 🎇', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&q=80' },
  { name: 'Presente Especial 🎁', url: 'https://images.unsplash.com/photo-1513201099495-a6998c4d5120?w=200&q=80' },
  { name: 'Neon Love 🌟', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80' },
  { name: 'Pôr do Sol Lindo ☀️', url: 'https://images.unsplash.com/photo-1507504038482-76319f2c610b?w=200&q=80' },
  { name: 'Passeio no Parque 🌳', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=80' },
  { name: 'Amor em Paris 🗼', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&q=80' },
  { name: 'Cisnes Apaixonados 🦢', url: 'https://images.unsplash.com/photo-1511216113906-8f57be831b56?w=200&q=80' },
  { name: 'Carta de Amor ✉️', url: 'https://images.unsplash.com/photo-1519782806509-66b96b349ca5?w=200&q=80' },
  { name: 'Sombra no Muro 👥', url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=200&q=80' },
  { name: 'Par Polaroid 📸', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80' },
  { name: 'Anel do Amor 💍', url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=200&q=80' },
  { name: 'Chocolate & Morango 🍓', url: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=200&q=80' },
  { name: 'Praia e Amor 🌊', url: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=200&q=80' },
  { name: 'Buquê da Noiva 💐', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=200&q=80' },
  { name: 'Chuva de Amor 🌧️', url: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=200&q=80' },
  { name: 'Piquenique a Dois 🧺', url: 'https://images.unsplash.com/photo-1526218626217-dc65a298444d?w=200&q=80' },
  { name: 'Violão no Luar 🎸', url: 'https://images.unsplash.com/photo-1482849297070-f4fae2173efe?w=200&q=80' },
  { name: 'Coração na Areia 🏖️', url: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=200&q=80' },
  { name: 'Caminho Juntos 👣', url: 'https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?w=200&q=80' },
  { name: 'Noite de Lareira 🔥', url: 'https://images.unsplash.com/photo-1475650529023-ec1714cd6777?w=200&q=80' },
  { name: 'Doce Paixão 🍬', url: 'https://images.unsplash.com/photo-1518049360-6a0904d9c490?w=200&q=80' },
  { name: 'Chave do Coração 🔑', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&q=80' },
  { name: 'Balões de Coração 🎈', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&q=80' },
  { name: 'Pôr do Sol Dourado 🌅', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=200&q=80' },
  { name: 'Romance Noturno 🌃', url: 'https://images.unsplash.com/photo-1505322022379-7c3353ee615c?w=200&q=80' },
  { name: 'Gato Apaixonado 🐱', url: 'https://images.unsplash.com/photo-1535905257518-6f69ad932efe?w=200&q=80' },
  { name: 'Tulipas Cor-de-rosa 🌷', url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=200&q=80' },
  { name: 'Jantar Romântico 🍽️', url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=200&q=80' },
  { name: 'Beijo na Floresta 🌲', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&q=80' },
  { name: 'Cãozinho Amoroso 🐶', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80' },
  { name: 'Céu de Estrelas 🌌', url: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=200&q=80' },
  { name: 'Parada no Lago 🏞️', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200&q=80' },
  { name: 'Alianças Douradas 💍', url: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=200&q=80' },
  { name: 'Conversa Doce 💬', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&q=80' },
  { name: 'Chá com Carinho 🍵', url: 'https://images.unsplash.com/photo-1515516969-d41d4cc47e04?w=200&q=80' },
  { name: 'Olhar do Amor 🥺', url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=200&q=80' },
  { name: 'Orvalho na Rosa 💧', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&q=80' },
  { name: 'Cerejeiras em Flor 🌸', url: 'https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?w=200&q=80' },
  { name: 'Glow Heart 💓', url: 'https://images.unsplash.com/photo-1468245856972-a0333f3f8293?w=200&q=80' },
  { name: 'Espuma de Coração ☕', url: 'https://images.unsplash.com/photo-1447078826665-1523b4169755?w=200&q=80' },
  { name: 'Bolo de Amor 🍰', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80' },
  { name: 'Estrelas de Ouro ✨', url: 'https://images.unsplash.com/photo-1496134732667-ae8d2853a045?w=200&q=80' },
  { name: 'Abraço de Urso 🧸', url: 'https://images.unsplash.com/photo-1513278974585-3c1135015ede?w=200&q=80' },
  { name: 'Amor Desenhado 🎨', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=200&q=80' }
];

export const NEW_STICKERS: Sticker[] = [
  { name: 'Girassol do Campo 🌻', url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&q=80' },
  { name: 'Sorvete Doce 🍦', url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=200&q=80' },
  { name: 'Luz Neon Cor-de-rosa 💡', url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c32662?w=200&q=80' },
  { name: 'Concha do Mar 🐚', url: 'https://images.unsplash.com/photo-1505244761439-d5a23733076a?w=200&q=80' },
  { name: 'Abóbora de Outono 🎃', url: 'https://images.unsplash.com/photo-1508349682734-181a25d9276c?w=200&q=80' },
  { name: 'Carrossel Mágico 🎠', url: 'https://images.unsplash.com/photo-1572244119864-4e782ea2ece5?w=200&q=80' },
  { name: 'Farol Solitário 🚨', url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200&q=80' },
  { name: 'Noite Lunar 🌙', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=200&q=80' },
  { name: 'Balão de Ar Quente 🎈', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80' },
  { name: 'Fogueira na Praia 🔥', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200&q=80' },
  { name: 'Ondas do Surf 🏄', url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=200&q=80' },
  { name: 'Marta Gatinha 🐾', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&q=80' },
  { name: 'Panda Dorminhoco 🐼', url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=200&q=80' },
  { name: 'Cacto Sorridente 🌵', url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=200&q=80' },
  { name: 'Hambúrguer Gourmet 🍔', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80' },
  { name: 'Macarons Coloridos 🥮', url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=200&q=80' },
  { name: 'Morango Silvestre 🍓', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&q=80' },
  { name: 'Pipoca com Filme 🍿', url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=200&q=80' },
  { name: 'Donut com Cobertura 🍩', url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80' },
  { name: 'Estrela-do-mar ⭐', url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=200&q=80' },
  { name: 'Leão Corajoso 🦁', url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=200&q=80' },
  { name: 'Coala Fofinho 🐨', url: 'https://images.unsplash.com/photo-1546182991-0f3a07b7dd1e?w=200&q=80' },
  { name: 'Tigre Nobre 🐯', url: 'https://images.unsplash.com/photo-1500462969106-f0651ee7240a?w=200&q=80' },
  { name: 'Pássaro Azul 🐦', url: 'https://images.unsplash.com/photo-1522850959076-58ed7705f5f3?w=200&q=80' },
  { name: 'Bicicleta com Flores 🚲', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200&q=80' },
  { name: 'Câmera Vintage 📷', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80' },
  { name: 'Balão de Coração Vermelho ❤️', url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&q=80' },
  { name: 'Veneza Romântica 🛶', url: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=200&q=80' },
  { name: 'Cabana nas Montanhas 🏔️', url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=200&q=80' },
  { name: 'Cachoeira Sagrada 🌊', url: 'https://images.unsplash.com/photo-1482862549707-f63cb32c51ee?w=200&q=80' },
  { name: 'Pôr do sol Rosa 🌅', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=200&q=80' },
  { name: 'Noite de Encontro 💑', url: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?w=200&q=80' },
  { name: 'Asas de Anjo 👼', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200&q=80' },
  { name: 'Girafa Curiosa 🦒', url: 'https://images.unsplash.com/photo-1538097304804-2a1b932466a9?w=200&q=80' },
  { name: 'Ovelha Fofinha 🐑', url: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=200&q=80' },
  { name: 'Abelha Melífera 🐝', url: 'https://images.unsplash.com/photo-1473201594911-08170c0c7bba?w=200&q=80' },
  { name: 'Borboleta Azul 🦋', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&q=80' },
  { name: 'Cachorro Alegre 🐕', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&q=80' },
  { name: 'Piscina de Verão 🏊', url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=200&q=80' },
  { name: 'Fatia de Pizza 🍕', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80' },
  { name: 'Sushi Combinado 🍣', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&q=80' },
  { name: 'Panquecas Doces 🥞', url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&q=80' },
  { name: 'Xícara de Chá 🍵', url: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=200&q=80' },
  { name: 'Coquetel Tropical 🍹', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&q=80' },
  { name: 'Caneca de Chopp 🍺', url: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=200&q=80' },
  { name: 'Vinho Tinto Classico 🍷', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&q=80' },
  { name: 'Morangos Frescos 🍓', url: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=200&q=80' },
  { name: 'Maçã Inteira 🍎', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&q=80' },
  { name: 'Cerejas Silvestres 🍒', url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200&q=80' },
  { name: 'Abacate Verde 🥑', url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&q=80' },
  { name: 'Balão de Diálogo 💭', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80' },
  { name: 'Lupa Detetive 🔍', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&q=80' },
  { name: 'Foguete Espacial 🚀', url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=200&q=80' },
  { name: 'Planeta Saturno 🪐', url: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=200&q=80' },
  { name: 'Candelabro Velas 🕯️', url: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=200&q=80' },
  { name: 'Chave Vintage 🔑', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&q=80' },
  { name: 'Mala de Viagem 🧳', url: 'https://images.unsplash.com/photo-1500530815614-230a33d83752?w=200&q=80' },
  { name: 'Passaporte Aberto ✈️', url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=200&q=80' },
  { name: 'Tenda de Acampar ⛺', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200&q=80' },
  { name: 'Bota de Trilha 🥾', url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&q=80' },
  { name: 'Guarda-chuva Amarelo ☂️', url: 'https://images.unsplash.com/photo-1484503781911-705364be2f85?w=200&q=80' },
  { name: 'Par de Patins 🛼', url: 'https://images.unsplash.com/photo-1518655061766-48f23af93e77?w=200&q=80' },
  { name: 'Balão do Pensamento 💬', url: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=200&q=80' },
  { name: 'Livros de Estudo 📚', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&q=80' },
  { name: 'Lápis do Desenho ✏️', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&q=80' },
  { name: 'Violino Clássico 🎻', url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=200&q=80' },
  { name: 'Piano de Cauda 🎹', url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=200&q=80' },
  { name: 'Fones de Ouvido 🎧', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80' },
  { name: 'Microfone de Show 🎤', url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=200&q=80' },
  { name: 'Dado de Sorte 🎲', url: 'https://images.unsplash.com/photo-1580234810907-b40315b76418?w=200&q=80' },
  { name: 'Tabuleiro Xadrez ♟️', url: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=200&q=80' },
  { name: 'Bolinha de Tênis 🎾', url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&q=80' },
  { name: 'Troféu Campeão 🏆', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&q=80' },
  { name: 'Bola de Cristal 🔮', url: 'https://images.unsplash.com/photo-1515516969-d41d4cc47e04?w=200&q=80' },
  { name: 'Diamante Lapidado 💎', url: 'https://images.unsplash.com/photo-1515524738708-327c6b0037a4?w=200&q=80' },
  { name: 'Saco de Dinheiro 💰', url: 'https://images.unsplash.com/photo-1502920514313-52581002a659?w=200&q=80' },
  { name: 'Espada Guerreiro ⚔️', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=80' },
  { name: 'Escudo Forte 🛡️', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=80' },
  { name: 'Âncora Pesada ⚓', url: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=200&q=80' },
  { name: 'Engrenagem Certa ⚙️', url: 'https://images.unsplash.com/photo-1518770660439-46331014ccce?w=200&q=80' },
  { name: 'Flor de Lótus 💮', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&q=80' },
  { name: 'Folha de Outono 🍁', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&q=80' },
  { name: 'Árvore de Carvalho 🌳', url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=200&q=80' },
  { name: 'Trevo de Sorte 🍀', url: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=200&q=80' },
  { name: 'Palmeira Tropical 🌴', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80' },
  { name: 'Coelho Saltitante 🐰', url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&q=80' },
  { name: 'Porquinho Fofo 🐷', url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=200&q=80' },
  { name: 'Macaco Sapeca 🐵', url: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=200&q=80' },
  { name: 'Galinha do Campo 🐔', url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200&q=80' },
  { name: 'Pinguim do Gelo 🐧', url: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf055?w=200&q=80' },
  { name: 'Casal Silhueta 👥', url: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?w=200&q=80' },
  { name: 'Sinalizador do Céu ☄️', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=200&q=80' },
  { name: 'Ninho de Amor 🪹', url: 'https://images.unsplash.com/photo-1504222441767-d63997ee71c1?w=200&q=80' },
  { name: 'Balões Brilhantes 🎈', url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=200&q=80' },
  { name: 'Estrela Cadente 🌠', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=200&q=80' },
  { name: 'Caneca Quente ☕', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80' },
  { name: 'Arco-Íris Lindo 🌈', url: 'https://images.unsplash.com/photo-1434064511983-18c6dae20ed5?w=200&q=80' },
  { name: 'Luzes Coloridas ✨', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&q=80' },
  { name: 'Parque de Diversão 🎡', url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=200&q=80' },
  { name: 'Coração Brilhante 💖', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&q=80' }
];

// 50 Expressive and high-quality romantic phrases in Portuguese to make stickers beautiful
export const ROMANCE_PHRASES: string[] = [
  'Te amo ❤️', 'Meu amor 💖', 'Minha vida 🥰', 'Meu tudão 😍', 'Você me faz feliz ✨',
  'Meu porto seguro ⚓', 'Eternamente seu/sua 💍', 'Dono do meu sorriso 😁', 'Razão de viver 🌸', 'Fica comigo 🥺',
  'Amor verdadeiro 💕', 'Sempre juntos 🤝', 'Dengo meu 🤗', 'Coisa linda 🌟', 'Meu raio de sol ☀️',
  'Amor sem fim ♾️', 'Te quero bem 🌹', 'Quero seu abraço 🫂', 'Beijo doce 💋', 'Meu dengo 🥰',
  'Meu abrigo 🏠', 'Minha metade ⚖️', 'Amor infinito 🌌', 'Te amo tanto 💞', 'Pensando em você 💭',
  'Amor da minha vida 💑', 'Sorte a minha 🍀', 'Coração que bate por ti 💓', 'Minha luz 💡', 'Doce companhia 🍬',
  'Eterno namorado(a) 💝', 'Você me completa 🍷', 'Paixão sem limites 🔥', 'Minha joia rara 💎', 'Feliz ao seu lado 🌈',
  'Dono do meu coração 🔑', 'O melhor abraço 🤗', 'Te amo daqui até a lua 🌙', 'Sempre em minha mente 🧠', 'Anjo meu 👼',
  'Meu par perfeito 👩‍❤️‍👨', 'Amor além da vida ⏳', 'Minha paz 🕊️', 'Sintonia pura 🎵', 'Te amo cada dia mais 📈',
  'Amor e cumplicidade 🤝', 'Luz dos meus olhos 👀', 'Coração quentinho 🔥', 'Tudo que sonhei 🌌', 'Meu destino favorito 📍'
];

const romanticPhotoIds = [
  '1518199266791-5375a83190b7', '1516589178581-6cd7833ae3b2', '1518895949257-7621c3c786d7', '1494972308805-463bc619b34e',
  '1501901609772-df0848060b33', '1492684223066-81342ee5ff30', '1513201099495-a6998c4d5120', '1516450360452-9312f5e86fc7',
  '1507504038482-76319f2c610b', '1502602898657-3e91760cbb34', '1511216113906-8f57be831b56', '1519782806509-66b96b349ca5',
  '1523438885200-e635ba2c371e', '1531746020798-e6953c6e8e04', '1582213782179-e0d53f98f2ca', '1551244072-5d12893278ab',
  '1529634597503-139d3726fed5', '1515934751635-c81c6bc9a2d8', '1549417229-aa67d3263c09', '1526218626217-dc65a298444d',
  '1482849297070-f4fae2173efe', '1511735111819-9a3f7709049c', '1464746133101-a2c3f88e0dd9', '1475650529023-ec1714cd6777',
  '1518049360-6a0904d9c490', '1509198397868-475647b2a1e5', '1530103862676-de8c9debad1d', '1518531933037-91b2f5f229cc',
  '1505322022379-7c3353ee615c', '1535905257518-6f69ad932efe', '1526047932273-341f2a7631f9', '1469371670807-013ccf25f16a',
  '1518495973542-4542c06a5843', '1517841905240-472988babdf9', '1534067783941-51c9c23ecefd', '1501785888041-af3ef285b470',
  '1474552226712-ac0f0961a954', '1522202176988-66273c2fd55f', '1515516969-d41d4cc47e04', '1518241353330-0f7941c2d9b5',
  '1518709268805-4e9042af9f23', '1529516548873-9ce57c8f155e', '1468245856972-a0333f3f8293', '1447078826665-1523b4169755',
  '1578985545062-69928b1d9587', '1496134732667-ae8d2853a045', '1513278974585-3c1135015ede', '1516627145497-ae6968895b74',
  '1513885535751-8b9238bd345a', '1515524738708-327c6b0037a4'
];

export const ROMANTIC_STICKERS: Sticker[] = ROMANCE_PHRASES.map((phrase, index) => {
  const photoId = romanticPhotoIds[index % romanticPhotoIds.length];
  return {
    name: phrase,
    url: `https://images.unsplash.com/photo-${photoId}?w=150&q=80`
  };
});

// 40 Expressive chill/vibe phrases in Portuguese
export const VIBE_PHRASES: string[] = [
  'Sem pressa ☕', 'Só paz 🍃', 'Vibe boa ✨', 'De boa 🎧', 'Luz própria 🌟',
  'Noite fria 🌙', 'Bons ventos 💨', 'Conexão pura 🔌', 'Mente livre 🧠', 'Foco no hoje 🎯',
  'Lofi-beats 🎵', 'Estilo de vida 🛹', 'Calma na alma 🧘', 'Silêncio bom 🤫', 'Luz neon 💡',
  'Sol e sal 🌊', 'Brilho interno 💎', 'Apenas sinta 😌', 'Tempo ao tempo ⏳', 'Sintonia fina 📻',
  'Cores da noite 🌌', 'Estrada livre 🛣️', 'Sem roteiro 🗺️', 'Momentos 📸', 'Offline 📴',
  'Coração leve 🤍', 'Sol da manhã 🌅', 'Chuva na janela 🌧️', 'Café quente ☕', 'Vibe retrô 📼',
  'Na minha 🛌', 'Flua como água 💧', 'Vento no rosto 🍃', 'Fim de tarde 🌇', 'Amor-próprio 🩹',
  'Energia positiva 🔋', 'Além do horizonte 🔭', 'Noites urbanas 🌃', 'Fogo interno 🔥', 'Viver o agora 🧭'
];

const vibePhotoIds = [
  '1515162305285-0293e4767cc2', '1505740420928-5e560c06d30e', '1511671782779-c97d3d27a1d4', '1518495973542-4542c06a5843',
  '1470225620780-dba8ba36b745', '1514525253161-7a46d19cd819', '1516450360452-9312f5e86fc7', '1513829096964-102f7cf313f4',
  '1519681393784-d120267933ba', '1501386761578-eac5c94b800a', '1513151233558-d860c5398176', '1518609878373-06d740f60d8b',
  '1498038432885-c6f3f1b912ee', '1520156473893-b42410a7840d', '1509198397868-475647b2a1e5', '1518173946687-a4c8a383392e',
  '1528459801416-a9e53bbf4e17', '1519389950473-47ba0277781c', '1506157786151-b8491531f063', '1517604931442-7e0c8ed2963c',
  '1513201099495-a6998c4d5120', '1483412033650-1015ddeb83d1', '1494232410401-ad00d5433cfa', '1516223725307-6f76b9ec8742',
  '1510133769092-8ed496efae75', '1518609878373-06d740f60d8b', '1459749411175-04bf5292ceea', '1526304640581-d334cdbbf45e',
  '1550517355-39724106511a', '1507525428034-b723cf961d3e', '1517841905240-472988babdf9', '1506318137071-a8e063b4bec0',
  '1515263487990-61b07816b324', '1557672172-298e090bd0f1', '1508739773434-c26b3d09e071', '1534447677768-be436bb09401',
  '1486406146926-c627a92ad1ab', '1533174072545-7a4b6ad7a6c3', '1527529482837-4698179dc6ce', '1520038410233-7141be7e6f97'
];

export const VIBE_STICKERS: Sticker[] = VIBE_PHRASES.map((phrase, index) => {
  const photoId = vibePhotoIds[index % vibePhotoIds.length];
  return {
    name: phrase,
    url: `https://images.unsplash.com/photo-${photoId}?w=150&q=80`
  };
});

// All Stickers
export const ALL_STICKERS: Sticker[] = [
  ...ORIGINAL_STICKERS,
  ...NEW_STICKERS
];

// Export expanded emojis and symbols
export const ALL_EMOJIS_AND_SYMBOLS: string[] = [
  // Originally from UI:
  '★','☆','✦','✧','⚡','🔥','✨','☄️','☀️','❄️','💎','🔮','🧿',
  '✿','❀','💮','🌸','🍀','🍁','🍃','☕','🍻','🥂','🍕','🎯','🏆','🎧','🎵','🎶',
  '🎬','👾','🎮','🎲','♠️','♥️','♦️','♣️','⚜️','🔱','🛡️','⚔️','⚓','⚙️','⚖️',
  '✉️','🖊️','🔑','🔒','❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔',
  '☮️','☯️','☸️','☪️','✝️','🕉️','𓆉','𓃠','𓅓','☾','☽','☀','☁','☂','☃','✈',
  
  // Custom Expanded - Smileys & Emotions (Over 50 beautiful expressions)
  '😀','😃','😄','😁','😆','😅','😂','🤣','🥲','☺️','😊','😇','🙂','🙃','😉','😌',
  '😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸',
  '🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢',
  '😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔',
  '🫣','🤭','🤫','🫠','🤥','😶','😐','😑','😬','🫥','🥱','😴','🤤','😪','😮‍💨','😵',
  
  // Custom Expanded - Love & Social Hearts
  '💖','💝','💕','💞','💓','💗','❤️‍🔥','❤️‍🩹','💘','🌹','🥀','💋','💌','💏','💑',
  
  // Custom Expanded - Hand Gestures & People
  '👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉',
  '👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏',
  '✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴',
  '👀','👁️','👅','👄',
  
  // Custom Expanded - Animals, Nature & Celestial
  '🦁','🐯','🐱','🐶','🐺','🐻','🐻‍❄️','🐨','🐼','🐹','🐭','🐰','🦊','🦝','🐮','🐷',
  '🐸','🐵','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','👑','🦄','🦓','🦒','🐘',
  '🦛','🦏','🐪','🐫','🪵','🌵','🎄','🌲','🌳','🌴','🪵','🌱','🌿','☘️','🍀','🎍',
  '🎋','🍃','🍂','🍁','🍄','🐚','🪸','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻',
  '🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌎','🪐','🌈','⚡','🔥','💥','⛄'
];
