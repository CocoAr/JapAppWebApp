/**
 * Generates src/data/vocabulary-katakana.json from embedded curriculum data.
 * Run: node scripts/build-katakana-vocab.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const topics = [
  { id: "kt_comida_y_bebida", label: "COMIDA Y BEBIDA" },
  { id: "kt_paises_y_regiones", label: "PAÍSES Y REGIONES" },
  { id: "kt_deportes", label: "DEPORTES" },
  { id: "kt_ropa_y_accesorios", label: "ROPA Y ACCESORIOS" },
  { id: "kt_transporte", label: "TRANSPORTE" },
  { id: "kt_hogar_y_muebles", label: "HOGAR Y MUEBLES" },
  { id: "kt_objetos_cotidianos", label: "OBJETOS COTIDIANOS" },
  { id: "kt_tecnologia_y_medios", label: "TECNOLOGÍA Y MEDIOS" },
  { id: "kt_estudio_y_trabajo", label: "ESTUDIO Y TRABAJO" },
  { id: "kt_comercio_y_servicios", label: "COMERCIO Y SERVICIOS" },
  { id: "kt_ocio_y_cultura", label: "OCIO Y CULTURA" },
  { id: "kt_misc", label: "VARIOS" },
];

const pages = [
  { id: "kt_page_1", label: "Nivel K 1 — Vocales y K" },
  { id: "kt_page_2", label: "Nivel K 2 — S y T (parte 1)" },
  { id: "kt_page_3", label: "Nivel K 3 — S y T (parte 2)" },
  { id: "kt_page_4", label: "Nivel K 4 — N y H (parte 1)" },
  { id: "kt_page_5", label: "Nivel K 5 — N y H (parte 2)" },
  { id: "kt_page_6", label: "Nivel K 6 — M e Y" },
  { id: "kt_page_7", label: "Nivel K 7 — R, W y ン (parte 1)" },
  { id: "kt_page_8", label: "Nivel K 8 — R, W y ン (parte 2)" },
  { id: "kt_page_9", label: "Nivel K 9 — R, W y ン (parte 3)" },
  { id: "kt_page_10", label: "Nivel K 10 — Combinaciones especiales (ようおん)" },
];

/** [katakana, spanish, topicId, pageId] */
const rows = [
  // P1
  ["カカオ", "cacao", "kt_comida_y_bebida", "kt_page_1"],
  ["キウイ", "kiwi", "kt_comida_y_bebida", "kt_page_1"],
  ["ケーキ", "torta / pastel", "kt_comida_y_bebida", "kt_page_1"],
  ["ココア", "cocoa / cacao caliente", "kt_comida_y_bebida", "kt_page_1"],
  // P2
  ["サーカス", "circo", "kt_ocio_y_cultura", "kt_page_2"],
  ["スキー", "esquí", "kt_deportes", "kt_page_2"],
  ["キス", "beso", "kt_misc", "kt_page_2"],
  ["スイス", "Suiza", "kt_paises_y_regiones", "kt_page_2"],
  ["アイス", "hielo", "kt_comida_y_bebida", "kt_page_2"],
  ["ステーキ", "bife / steak", "kt_comida_y_bebida", "kt_page_2"],
  ["スーツ", "traje", "kt_ropa_y_accesorios", "kt_page_2"],
  ["スカート", "pollera", "kt_ropa_y_accesorios", "kt_page_2"],
  ["クイズ", "quiz / cuestionario", "kt_estudio_y_trabajo", "kt_page_2"],
  ["セーター", "suéter / pulóver", "kt_ropa_y_accesorios", "kt_page_2"],
  ["ソーセージ", "salchicha", "kt_comida_y_bebida", "kt_page_2"],
  ["タクシー", "taxi", "kt_transporte", "kt_page_2"],
  ["ギター", "guitarra", "kt_ocio_y_cultura", "kt_page_2"],
  ["チーズ", "queso", "kt_comida_y_bebida", "kt_page_2"],
  // P3
  ["テスト", "examen / prueba", "kt_estudio_y_trabajo", "kt_page_3"],
  ["デート", "cita", "kt_misc", "kt_page_3"],
  ["デザート", "postre", "kt_comida_y_bebida", "kt_page_3"],
  ["ドア", "puerta", "kt_hogar_y_muebles", "kt_page_3"],
  ["ドイツ", "Alemania", "kt_paises_y_regiones", "kt_page_3"],
  ["カード", "tarjeta", "kt_objetos_cotidianos", "kt_page_3"],
  ["クッキー", "galletita", "kt_comida_y_bebida", "kt_page_3"],
  ["サッカー", "fútbol", "kt_deportes", "kt_page_3"],
  ["カッター", "cúter", "kt_objetos_cotidianos", "kt_page_3"],
  ["スイッチ", "interruptor", "kt_objetos_cotidianos", "kt_page_3"],
  // P4
  ["カナダ", "Canadá", "kt_paises_y_regiones", "kt_page_4"],
  ["テニス", "tenis", "kt_deportes", "kt_page_4"],
  ["カヌー", "canoa", "kt_deportes", "kt_page_4"],
  ["ネクタイ", "corbata", "kt_ropa_y_accesorios", "kt_page_4"],
  ["ノート", "cuaderno", "kt_estudio_y_trabajo", "kt_page_4"],
  ["バイク", "moto", "kt_transporte", "kt_page_4"],
  ["バス", "colectivo / micro", "kt_transporte", "kt_page_4"],
  ["バター", "manteca", "kt_comida_y_bebida", "kt_page_4"],
  ["バナナ", "banana", "kt_comida_y_bebida", "kt_page_4"],
  ["バッグ", "bolso / cartera", "kt_objetos_cotidianos", "kt_page_4"],
  ["バスケット", "básquet", "kt_deportes", "kt_page_4"],
  ["スーパー", "supermercado / súper", "kt_comercio_y_servicios", "kt_page_4"],
  ["デパート", "tienda departamental", "kt_comercio_y_servicios", "kt_page_4"],
  ["コーヒー", "café", "kt_comida_y_bebida", "kt_page_4"],
  ["ピザ", "pizza", "kt_comida_y_bebida", "kt_page_4"],
  ["ピアノ", "piano", "kt_ocio_y_cultura", "kt_page_4"],
  ["ナイフ", "cuchillo", "kt_objetos_cotidianos", "kt_page_4"],
  ["スープ", "sopa", "kt_comida_y_bebida", "kt_page_4"],
  ["カップ", "taza", "kt_objetos_cotidianos", "kt_page_4"],
  ["コップ", "vaso", "kt_objetos_cotidianos", "kt_page_4"],
  // P5
  ["ベッド", "cama", "kt_hogar_y_muebles", "kt_page_5"],
  ["ペット", "mascota", "kt_misc", "kt_page_5"],
  ["ホッケー", "hockey", "kt_deportes", "kt_page_5"],
  ["ポスト", "buzón", "kt_objetos_cotidianos", "kt_page_5"],
  ["ポテト", "papas fritas", "kt_comida_y_bebida", "kt_page_5"],
  ["ポケット", "bolsillo", "kt_ropa_y_accesorios", "kt_page_5"],
  ["スポーツ", "deportes", "kt_deportes", "kt_page_5"],
  ["パスポート", "pasaporte", "kt_objetos_cotidianos", "kt_page_5"],
  // P6
  ["トマト", "tomate", "kt_comida_y_bebida", "kt_page_6"],
  ["ゲーム", "juego", "kt_ocio_y_cultura", "kt_page_6"],
  ["けしゴム", "goma de borrar", "kt_estudio_y_trabajo", "kt_page_6"],
  ["ハム", "jamón", "kt_comida_y_bebida", "kt_page_6"],
  ["メキシコ", "México", "kt_paises_y_regiones", "kt_page_6"],
  // P7
  ["ライス", "arroz", "kt_comida_y_bebida", "kt_page_7"],
  ["ラジオ", "radio", "kt_tecnologia_y_medios", "kt_page_7"],
  ["クラス", "clase", "kt_estudio_y_trabajo", "kt_page_7"],
  ["サラダ", "ensalada", "kt_comida_y_bebida", "kt_page_7"],
  ["カメラ", "cámara", "kt_tecnologia_y_medios", "kt_page_7"],
  ["イギリス", "Inglaterra / Reino Unido", "kt_paises_y_regiones", "kt_page_7"],
  ["イタリア", "Italia", "kt_paises_y_regiones", "kt_page_7"],
  ["チリ", "Chile", "kt_paises_y_regiones", "kt_page_7"],
  ["アメリカ", "Estados Unidos", "kt_paises_y_regiones", "kt_page_7"],
  ["オーストラリア", "Australia", "kt_paises_y_regiones", "kt_page_7"],
  ["クリスマス", "Navidad", "kt_ocio_y_cultura", "kt_page_7"],
  ["アイスクリーム", "helado", "kt_comida_y_bebida", "kt_page_7"],
  ["ウルグアイ", "Uruguay", "kt_paises_y_regiones", "kt_page_7"],
  ["ビル", "edificio", "kt_comercio_y_servicios", "kt_page_7"],
  ["ビール", "cerveza", "kt_comida_y_bebida", "kt_page_7"],
  ["テーブル", "mesa", "kt_hogar_y_muebles", "kt_page_7"],
  ["ホテル", "hotel", "kt_comercio_y_servicios", "kt_page_7"],
  ["パイナップル", "ananá", "kt_comida_y_bebida", "kt_page_7"],
  ["ミルク", "leche", "kt_comida_y_bebida", "kt_page_7"],
  ["メール", "mail / correo electrónico", "kt_tecnologia_y_medios", "kt_page_7"],
  ["ブラジル", "Brasil", "kt_paises_y_regiones", "kt_page_7"],
  ["レジ", "caja / caja registradora", "kt_comercio_y_servicios", "kt_page_7"],
  ["レタス", "lechuga", "kt_comida_y_bebida", "kt_page_7"],
  ["レポート", "informe / reporte", "kt_estudio_y_trabajo", "kt_page_7"],
  ["エスカレーター", "escalera mecánica", "kt_comercio_y_servicios", "kt_page_7"],
  // P8
  ["エレベーター", "ascensor", "kt_comercio_y_servicios", "kt_page_8"],
  ["カレー", "curry", "kt_comida_y_bebida", "kt_page_8"],
  ["テレビ", "televisor / tele", "kt_tecnologia_y_medios", "kt_page_8"],
  ["トイレ", "baño", "kt_hogar_y_muebles", "kt_page_8"],
  ["ロシア", "Rusia", "kt_paises_y_regiones", "kt_page_8"],
  ["ロビー", "lobby / hall", "kt_comercio_y_servicios", "kt_page_8"],
  ["ワイン", "vino", "kt_comida_y_bebida", "kt_page_8"],
  ["アルゼンチン", "Argentina", "kt_paises_y_regiones", "kt_page_8"],
  ["インド", "India", "kt_paises_y_regiones", "kt_page_8"],
  ["インターネット", "internet", "kt_tecnologia_y_medios", "kt_page_8"],
  ["エンジニア", "ingeniero / ingeniera", "kt_estudio_y_trabajo", "kt_page_8"],
  ["オレンジ", "naranja", "kt_comida_y_bebida", "kt_page_8"],
  ["カレンダー", "calendario", "kt_objetos_cotidianos", "kt_page_8"],
  ["コンビニ", "kiosco / mini súper / tienda 24 hs", "kt_comercio_y_servicios", "kt_page_8"],
  ["スプーン", "cuchara", "kt_objetos_cotidianos", "kt_page_8"],
  ["スペイン", "España", "kt_paises_y_regiones", "kt_page_8"],
  ["ズボン", "pantalón", "kt_ropa_y_accesorios", "kt_page_8"],
  ["ハンバーグ", "hamburguesa al plato / medallón de carne", "kt_comida_y_bebida", "kt_page_8"],
  ["ハンバーガー", "hamburguesa", "kt_comida_y_bebida", "kt_page_8"],
  ["バレンタイン", "San Valentín", "kt_ocio_y_cultura", "kt_page_8"],
  ["パソコン", "computadora / compu", "kt_tecnologia_y_medios", "kt_page_8"],
  ["パンツ", "calzoncillo / ropa interior", "kt_ropa_y_accesorios", "kt_page_8"],
  ["ピンポン", "ping-pong / tenis de mesa", "kt_deportes", "kt_page_8"],
  ["フランス", "Francia", "kt_paises_y_regiones", "kt_page_8"],
  ["プレゼント", "regalo", "kt_misc", "kt_page_8"],
  // P9
  ["ボタン", "botón", "kt_objetos_cotidianos", "kt_page_9"],
  ["ボールペン", "birome", "kt_objetos_cotidianos", "kt_page_9"],
  ["メロン", "melón", "kt_comida_y_bebida", "kt_page_9"],
  ["レモン", "limón", "kt_comida_y_bebida", "kt_page_9"],
  ["レストラン", "restaurante", "kt_comercio_y_servicios", "kt_page_9"],
  ["でんしレンジ", "microondas", "kt_hogar_y_muebles", "kt_page_9"],
  ["トイレットペーパー", "papel higiénico", "kt_hogar_y_muebles", "kt_page_9"],
  // P10
  ["キャベツ", "repollo", "kt_comida_y_bebida", "kt_page_10"],
  ["バーベキュー", "barbacoa / parrillada", "kt_comida_y_bebida", "kt_page_10"],
  ["シャツ", "camisa", "kt_ropa_y_accesorios", "kt_page_10"],
  ["Tシャツ", "remera", "kt_ropa_y_accesorios", "kt_page_10"],
  ["シャープペンシル", "portaminas / lápiz mecánico", "kt_estudio_y_trabajo", "kt_page_10"],
  ["ジュース", "jugo", "kt_comida_y_bebida", "kt_page_10"],
  ["チョコレート", "chocolate", "kt_comida_y_bebida", "kt_page_10"],
  ["メニュー", "menú", "kt_comercio_y_servicios", "kt_page_10"],
  ["コンピューター", "computadora", "kt_tecnologia_y_medios", "kt_page_10"],
];

const words = rows.map(([katakana, spanish, topic, page], i) => ({
  id: `kw${String(i + 1).padStart(3, "0")}`,
  katakana,
  spanish,
  page,
  topics: [topic],
}));

const out = { pages, topics, words };
const path = join(root, "src/data/vocabulary-katakana.json");
writeFileSync(path, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log("Wrote", words.length, "words to", path);
