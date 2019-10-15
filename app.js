const Discord = require("discord.js");
const client = new Discord.Client();
var pool = require ('./clientpool.js');   

prefix = '!';
let coef; let embName; let embMsg;
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
}) 

client.on("ready", () => {
  console.log(`Logged in as ${client.user.username}`);
  client.user.setActivity('Betting');
  pool.connect( (err, client, done) => {
    if(err) throw err; 
            client.query('create table if not exists betting( \
                name text, \
                pts integer default 0, \
                pts_month integer default 0, \
                pts_total integer default 0)', (err, result) => {
            });
            client.query('create table if not exists bet_count( \
                id text primary key, \
                name text, \
                n_count integer default 0)', (err, result) => {
            });
});
  pool.connect(err => {
  if(err) throw err; 
  console.log('Connected to PostgresSQL'); });
 });
        
client.on('messageReactionAdd', (reaction, user) => {

    reaction.message.embeds.forEach((embed) => {
      embMsg = embed.description;
      coef = embed.description.split(':');
      embName = embed.title.split(':');
      console.log('coef '+coef);
    })
  if ((reaction.emoji.name === '✅') && (user.id === '330832623435907076')) {
 //   var coef = reaction.message.content.split(':');

    var prize = coef[3]*1000;
    console.log(embMsg.substr(6,embMsg-9));
    reaction.message.edit({embed:{
                            color: 0x18ff93,
                            title: `${embName[0]}: прогнозов в туре :${embName[2]}`,
                            description: `\`\`\`fix
${embMsg.substr(6,embMsg.length-9)} = + ${prize}\`\`\``
                 }})
}
  if ((reaction.emoji.name === '❎') && (user.id === '330832623435907076')) {
 //   var coef = reaction.message.content.split(':');

    var prize = 1000;
    console.log(embMsg.substr(6,embMsg-9));
    reaction.message.edit({embed:{
                            color: 0xff9318,
                            title: `${embName[0]}: прогнозов в туре :${embName[2]}`,
                            description: `\`\`\`fix
${embMsg.substr(6,embMsg.length-9)} +1000\`\`\``
                 }})
}
  if ((reaction.emoji.name === '❌')  && (user.id === '330832623435907076')) {
 //   var coef = reaction.message.content.split(':');

    var prize = -1000;
    console.log(embMsg.substr(6,embMsg-9));
    reaction.message.edit({embed:{
                            color: 0xff1818,
                            title: `${embName[0]}: прогнозов в туре :${embName[2]}`,
                            description: `\`\`\`fix
${embMsg.substr(6,embMsg.length-9)} -1000\`\`\``
                 }})
}
// NO EMBED NO EMBED NO EMBED NO EMBED NO EMBED 
 /* reaction.message.edit(`\`\`\`fix
${reaction.message.content.substr(6,reaction.message.content.length-9)} = + ${prize}\`\`\``);*/

  pool.connect( (err, client_db, done) => {
      if (err) throw err
        console.log('name '+embName[0]);
      console.log('prize '+prize);
      client_db.query('UPDATE betting SET pts = pts + $1, pts_month = pts_month + $1, pts_total = pts_total + $1 WHERE name = $2', [prize, embName[0]], (err, result) => {
                done(err);
              if (result.rowCount == 0){
               client_db.query('INSERT INTO betting (name, pts, pts_month, pts_total) VALUES ($1, $2, $3, $4)',
               [embName[0], prize, prize, prize]);
           //    message.channel.send(`Пользователь добавлен в базу.`);
          }
      });
    });
});

//---------------------
// CLIENT.ON MESSAGE =>
//---------------------

client.on("message", (message) => {
  if (message.channel.id === '615645325964869641') {

if (message.content.startsWith("!bet")) {
  function func(){ 
    var msg = message.content.toString();
    var one_bet_len = message.content.split("\n").length-1;
    var one_bet = message.content.split("\n");
    var ch = [];

for (i = 1; i <= one_bet_len; i++) {
    ch = one_bet[i].split(':');
    if (!one_bet[i].substr(-4).includes('.')) return message.reply('неверный разделитель в коэффициенте. Пример: **1.68**');
    if (ch.length != 3) return message.reply('неверные разделители. Пример: **Украина - Португалия : ТБ2.5 : 1.68**');
}
console.log(ch.length);
   pool.connect( async function(err, client_db, done) {
      if (err) throw err 
        await client_db.query('UPDATE bet_count SET n_count = n_count + '+ one_bet_len +' WHERE id = $1',
        [message.author.id], (err, result) => {
        //  done(err);
                });
          await client_db.query('SELECT n_count FROM bet_count WHERE id = $1', 
          [message.author.id], (err, result) => {
          done()
          if (err) throw err
                  if (result.rowCount != 0) {
                        count = result.rows[0].n_count;
             /*     if (count == 10) { 
                          message.reply("вы сделали максимум прогнозов на этот тур: " + `${count}`);} 
                  else if(count > 10) {
                         message.reply("вы превысили максимум прогнозов на этот тур: " + `${count}` + ". Учтутся только первые 10.");} 
            */ if (one_bet_len - count == 0) count = 0; else count = count - one_bet_len;
            for (i = 1; i <= one_bet_len; i++) {

                  client.channels.get("615645599965904917").send({embed:{
                            color: 0xbbbbbb,
                            title: `${message.member.user.tag}: прогнозов в туре : ${count+i}`,
                            description: `\`\`\`fix
: ${one_bet[i]} :\`\`\``
                 }}); 
            }


  // БЕЗ ЭМБЕДА  // БЕЗ ЭМБЕДА  // БЕЗ ЭМБЕДА
                  /*
                  for (i = 1; i <= one_bet_len; i++) {
                 // client.channels.get("615645599965904917").send(one);
                      message.channel.send(`\`\`\`fix
  : ${message.member.user.tag} : ${one_bet[i]} : \`\`\``);
                } */

                  } else {message.channel.send(`Пользователя нет в списке участников.`);}
               });
           });
   } 
   func();
}

  //if ((message.author.id === "374449104258072586") & (message.content.length > 200)) {
   // message.react('🚔');

  if (message.content.startsWith("!clearbet") && message.member.roles.has('370893800173731850')) {
      var args = message.content.slice(1).split(' ');
      var command = args.shift().toLowerCase();
    //  && message.member.roles.has('370893800173731850'))
      pool.query('UPDATE bet_count SET n_count = 0', (err, result) => {
      });
      pool.query('UPDATE betting SET pts = 0', (err, result) => {
          message.channel.send('Информация о текущем туре обновлена.');
      });

      if (args[0] == 'mon') pool.query('UPDATE betting SET pts_month = 0', (err, result) => {
      });
 }
    if (message.content.startsWith("!setcount") && message.member.roles.has('370893800173731850')) {
      const args = message.content.slice(prefix.length).split(' ');
      const command = args.shift().toLowerCase();
    pool.connect( (err, client_db, done) => {
      if (err) throw err
      client_db.query('UPDATE bet_count SET n_count = $1 WHERE id = $2', [args[0],args[1]], (err, result) => {
                done(err);
              if (result.rowCount == 0){
               client_db.query('INSERT INTO bet_count (id, name, n_count) VALUES ($1, $2, $3)',
               [args[1], args[2], args[0]]);
               message.channel.send(`Пользователь добавлен в базу.`);
          } else {
                message.channel.send(`Счетчик прогнозов обновлен.`); }
      });
    });
        }
        
if (message.content.startsWith("!топ-тур")) {
     pool.connect( (err, client_db, done) => {
          if (err) throw err
          var name = '';
          var pt = '';
          var n = 0;
          client_db.query('SELECT name, pts FROM betting ORDER BY pts DESC LIMIT 10', (err, res) => {
                done(err);
                const data = res.rows;
                data.forEach(row => {
                name += `${n+=1}. ${row.name} \n`;
                pt += `${row.pts} \n`;
            })
          message.channel.send({embed:{
          color: 0xff9312,
          title: "Топ-10 текущего тура",
          fields: [
            {
              "name": 'Ник',
              "value": `**${name}**`,
              "inline": true
            },
            {
              "name": 'Баллы',
              "value": `${pt}`,
              "inline": true
            }
            ]      
          }});
           });
        })
 }
if (message.content.startsWith("!топ-мес")) {
     pool.connect( (err, client_db, done) => {
          if (err) throw err
          var name = '';
          var pt = '';
          var n = 0;
          client_db.query('SELECT name, pts_month FROM betting ORDER BY pts_month DESC LIMIT 10', (err, res) => {
                done(err);
                const data = res.rows;
                data.forEach(row => {
                name += `${n+=1}. ${row.name} \n`;
                if (pt) pt += `${row.pts} \n`; else pt = 0;
            })
          message.channel.send({embed:{
          color: 0xff9312,
          title: "Топ-10 текущего месяца",
          fields: [
            {
              "name": 'Ник',
              "value": `**${name}**`,
              "inline": true
            },
            {
              "name": 'Баллы',
              "value": `${pt}`,
              "inline": true
            }
            ]      
          }});
           });
        })
 }

}  
});
 
client.login(process.env.BOT_TOKEN);
