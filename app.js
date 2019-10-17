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
            client.query(`create table if not exists betting( \
                name text primary key, \
                pts integer default 0, \
                count integer default 0, \
                won_count integer default 0, \
                pts_mth integer default 0, \
                count_mth integer default 0, \
                won_count_mth integer default 0, \
                pts_total integer default 0, \
                count_total integer default 0, \
                won_count_total integer default 0, \
                percent real default 0.00)`, (err, result) => {
            });
});
  pool.connect(err => {
  if(err) throw err; 
  console.log('Connected to PostgresSQL'); });
 });
        
client.on('messageReactionAdd', (reaction, user) => {
if ((user.id === '330832623435907076') && (reaction.message.channel.id == '615645599965904917')) {
    var won_count = 0;  // кол-во правильныъ прогнозов
    var prize; // баллы за ставку
    var back = 0; // возврат ставки
    reaction.message.embeds.forEach((embed) => {
      embMsg = embed.description;
      coef = embed.description.split(':');
      embName = embed.title.split(':');
    })
  if ((reaction.emoji.name === '✅') && (user.id === '330832623435907076')) {
    prize = coef[3]*1000-1000;
    won_count += 1;
    reaction.message.edit({embed:{
                            color: 0x18ff93,
                            title: `${embName[0]}: прогнозов в туре :${embName[2]}`,
                            description: `\`\`\`diff
+${prize} ${embMsg.substr(8,embMsg.length-12)}\`\`\``
                 }})
}
  if ((reaction.emoji.name === '🇽') && (user.id === '330832623435907076')) {
    prize = 0;
    back += 1;
    reaction.message.edit({embed:{
                            color: 0xff9318,
                            title: `${embName[0]}: прогнозов в туре :${embName[2]}`,
                            description: `\`\`\`diff
возврат ${embMsg.substr(8,embMsg.length-12)}\`\`\``
                 }})
}
  if ((reaction.emoji.name === '❌')  && (user.id === '330832623435907076')) {
 //   var coef = reaction.message.content.split(':');

    var prize = -1000;
    reaction.message.edit({embed:{
                            color: 0xff1818,
                            title: `${embName[0]}: прогнозов в туре :${embName[2]}`,
                            description: `\`\`\`diff
-1000 ${embMsg.substr(8,embMsg.length-12)}\`\`\``
                 }})
}
// NO EMBED NO EMBED NO EMBED NO EMBED NO EMBED 
 /* reaction.message.edit(`\`\`\`fix
${reaction.message.content.substr(6,reaction.message.content.length-9)} = + ${prize}\`\`\``);*/

    pool.query(`UPDATE betting SET
      pts = pts + $1, pts_mth = pts_mth + $1, pts_total = pts_total + $1,
      count = count - $2, count_mth = count_mth - $2, count_total = count_total - $2,
      won_count = won_count + $3, won_count_mth = won_count_mth + $3, won_count_total = won_count_total + $3
      WHERE name = $4`,
      [prize, back, won_count, embName[0]], (err, result) => {
            if (err) throw err 
    });
  }
});

//---------------------
// CLIENT.ON MESSAGE =>
//---------------------

client.on("message", (message) => {
  if (message.channel.id === '615645325964869641') {
      if (message.content.startsWith("!bet")) {
        func();
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
         pool.connect( async function(err, client_db, done) {
            if (err) throw err 
            await client_db.query(`UPDATE betting SET
              count = count + $1, count_mth = count_mth + $1, count_total = count_total + $1 
              WHERE name = $2`,
            [one_bet_len, message.member.user.tag], (err, result) => {
                    });  //  done(err);
                await client_db.query('SELECT count FROM betting WHERE name = $1', 
          [message.member.user.tag], (err, result) => {
          done()
          if (err) return message.channel.send(`Пользователя нет в списке участников.`);
                  if (result.rowCount != 0) {
                        count = result.rows[0].count;
                        if (count == 10) { 
                                message.reply("вы сделали максимум прогнозов на этот тур: " + `${count}`);} 
                        else if(count > 10) {
                               message.reply("вы превысили максимум прогнозов на этот тур: " + `${count}` + ". Учтутся только первые 10.");} 
                         if (one_bet_len - count == 0) count = 0; else count = count - one_bet_len;
                        for (i = 1; i <= one_bet_len; i++) {
                            client.channels.get("615645599965904917").send({embed:{
                                color: 0x666666,
                                title: `${message.member.user.tag}: прогнозов в туре : ${count+i}`,
                                description: `\`\`\`diff
: ${one_bet[i]} :\`\`\``
                            }}); 
                        }
                  } else message.channel.send(`Пользователя нет в списке участников.`);
               });
           });
   } 
}
if (message.content.startsWith("!топ-тур")) {
     pool.connect( (err, client_db, done) => {
          if (err) throw err
          var name = ''; var pr_c = ''; var pr_t = '';
          //var proc = '';
          var n = 0;
          client_db.query('SELECT name, pts, count FROM betting WHERE pts < 0 OR pts > 0 ORDER BY pts DESC LIMIT 15', (err, res) => {
                done(err);
                const data = res.rows;
                data.forEach(row => {
                name += `${n+=1}.\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${row.name} \n`; // имя участника
                pr_c += `${row.count} \n`; // кол-во прогнозов
                pr_t += `${row.pts} \n`; // // баллы участника
              //  if (pr_t) pr_t += `${row.pts} \n`; else pr_t = 0;
            })
          if (res.rowCount != 0) {
          message.channel.send({embed:{
          color: 0xff9312,
          title: "Топ текущего тура",
          fields: [
            {
              "name": 'Ник',
              "value": `**${name.substr(0, name.length-7)}**`,
              "inline": true
            },
            {
              "name": 'Баллы',
              "value": `${pr_t}`,
              "inline": true
            },
            {
              "name": 'Прогнозов',
              "value": `${pr_c}`,
              "inline": true
            }
            ]      
          }});
        } else message.channel.send('Недостаточно прогнозов');
           });
        })
 }
 if (message.content.startsWith("!топ-мес")) {
     pool.connect( (err, client_db, done) => {
          if (err) throw err
          var name = ''; var pr_c = '';
          var pt = '';
          var n = 0;
          client_db.query('SELECT name, pts_mth, count_mth FROM betting WHERE pts_mth < 0 OR pts_mth > 0 ORDER BY pts_mth DESC LIMIT 15', (err, res) => {
                done(err);
                const data = res.rows;
                data.forEach(row => {
                name += `${n+=1}.\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${row.name} \n`;
                pt += `${row.pts_mth} \n`; // баллы участника
                pr_c += `${row.count_mth} \n`; // кол-во прогнозов
             //   if (pt) pt += `${row.pts} \n`; else pt = 0;
            })
          if (res.rowCount != 0) {
          message.channel.send({embed:{
          color: 0xff9312,
          title: "Топ текущего месяца",
          fields: [
            {
              "name": 'Ник',
              "value": `**${name.substr(0, name.length-7)}**`,
              "inline": true
            },
            {
              "name": 'Баллы',
              "value": `${pt}`,
              "inline": true
            },
            {
              "name": 'Прогнозов',
              "value": `${pr_c}`,
              "inline": true
            }
            ]      
          }});
          } else message.channel.send('Недостаточно прогнозов');
           });
        })
 }
  if (message.content.startsWith("!топ-общ")) {
     pool.connect( (err, client_db, done) => {
          if (err) throw err
          var name = ''; var pr_c = '';
          var pt = '';
          var n = 0;
          client_db.query('SELECT name, pts_total, count_total FROM betting WHERE count_total > 40 ORDER BY pts_total DESC LIMIT 20', (err, res) => {
                done(err);
                const data = res.rows;
                data.forEach(row => {
                name += `${n+=1}. ${row.name} \n`;
                pt += `${row.pts_total} \n`; // баллы участника
                pr_c += `${row.count_total} \n`; // кол-во прогнозов
             //   if (pt) pt += `${row.pts} \n`; else pt = 0;
            })
          if (res.rowCount != 0) {
          message.channel.send({embed:{
          color: 0xff9312,
          title: "Топ за все время",
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
            },
            {
              "name": 'Прогнозов',
              "value": `${pr_c}`,
              "inline": true
            }
            ]      
          }});
          } else message.channel.send('Недостаточно прогнозов');
           });
        })
 }

  if (message.content.startsWith("!clearbet") && message.member.roles.has('370893800173731850')) {
var args = message.content.slice(1).split(' ');
      var command = args.shift().toLowerCase();
    //  && message.member.roles.has('370893800173731850'))

if (args[0] == 'mon') pool.query('UPDATE betting SET pts_mth = 0, count_mth = 0, won_count_mth = 0', (err, result) => {
  message.channel.send('Информация о текущем сезоне обновлена.');
      });
    else pool.query(`UPDATE betting SET 
      pts = 0, count = 0, won_count = 0`, (err, result) => {
        message.channel.send('Информация о текущем туре обновлена.');
      });
 }
if (message.content.startsWith("!setuser") && message.member.roles.has('370893800173731850')) {
      const args = message.content.slice(1).split(' ');
      const command = args.shift().toLowerCase();

      pool.query(`INSERT INTO betting 
        (name, pts, count, won_count, pts_mth, count_mth, won_count_mth, pts_total, count_total, won_count_total, percent) 
        VALUES ($1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.00)`,
               [args[0]], (err, res) => {
                if (err) throw err
                message.channel.send(`Пользователь добавлен в базу.`);
               });
  }

}  
});
 
client.login(process.env.BOT_TOKEN);
