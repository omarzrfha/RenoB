const express = require('express');
const app = express();
const keep_alive = require('./keep_alive.js')

const db = require('pro.db');
const {
    MessageActionRow,
    Intents,
    MessageAttachment,
    MessageSelectMenu,
    MessageButton,
    WebhookClient,
    MessageEmbed,
    Client,
    Collection,
    Discord,
    Permissions,
    Guilds,
   GuildMessages,
   MessageContent,
  GUILD_VOICE_STATES,
} = require('discord.js');

const client = new Client({
  intents: new Intents(32767),
});

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const os = require('os');
module.exports = client;
client.commands = new Collection();
client.slashCommands = new Collection();
const prefix = '.';
client.setMaxListeners(0);
const commands = [];

const CMD = [];
client.Scommands = new Collection();

  client.on('interactionCreate', (interaction) => {
    if (!interaction.isCommand()) return;
    const command = client.Scommands.get(interaction.commandName);
    if (!command) return;
    try {
      command.execute(client, interaction);
    } catch (err) {
      if (err) {
        console.log(err);
      }
    }
  });

  const rest = new REST({ version: '9' }).setToken(process.env.token);
  (async () => {
    try {
      console.log('Started refreshing application (/) commands.');
      await rest.put(Routes.applicationCommands(clientId), { body: CMD });
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  });

client.on("ready" , () => {
  console.log(`Logged in as ${client.user.tag}!`)

});



const categoryIDs = ['995631147532955708', '995632149464100944', '995631831925923961'];
const reallow = '957442639018491925';

client.on('messageCreate', async (message) => {
  if (message.channel.parent && categoryIDs.includes(message.channel.parent.id) && message.member.roles.cache.has(reallow)) {
    if (message.content.startsWith('.re') && message.content.length > 4) {
      const newName = message.content.slice(4);
      message.channel.setName(newName);
      message.channel.send('تم تغيير اسم التكت الى ' + newName);
    }
  }
});







client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  const isTicketManager = message.member.roles.cache.has(ticketManagerRoleId);
  const allowedCategories = ['995631147532955708', '995632149464100944', '995631831925923961'];
  const isAllowedCategory = message.channel.parent && allowedCategories.includes(message.channel.parent.id);
    
  if (isTicketManager && isAllowedCategory && content === 'غلق') {
    const embedMessage = new MessageEmbed()
      .setTitle('تنبيه ⚠️')
      .setDescription('هاذا التكت معرض للإغلاق خلال ثلاث دقائق في حالة عدم الرد');

    message.channel.send({ embeds: [embedMessage] });
  }
});








const ticketManagerRoleId = '957442639018491925';
const logChannelId = '1048615495147999264';

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('.gban') && message.member.roles.cache.has(ticketManagerRoleId)) {
    // Extracting the messages after the command
    const [, message1, message2, message3] = message.content.split(' ');

    // Creating the formatted message with Embed
    const formattedMessage = new MessageEmbed()
      .setTitle('قائمة الحظر')
      .setDescription(`
        ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        **اسم المواطن:** ${message1}

        **السبب:** ${message2}

        **تاريخ الفك:** ${message3}

        ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

        **ملاحظة: في حال نظرت بأن الباند تم عن طريق الخطأ يرجى فتح تكت المساعدة**
      `)
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      })
      .setColor('#ff0000'); // يمكنك تغيير لون الـ Embed حسب تفضيلاتك
    




    // Sending the message to the log channel
    const logChannel = await client.channels.fetch(logChannelId);
    logChannel.send({ embeds: [formattedMessage] });
  }
});;










const trackedRoleID = '957442638980730934';
const trackedChannelID = '957442641459576871';
const notificationChannelID = '1189610179143147641';
const databaseFile = 'database.json';

let messageCounts = new Map();

client.on('messageCreate', (message) => {
  if (message.channel.id === trackedChannelID) {
    const member = message.guild.members.cache.get(message.author.id);

    if (member && member.roles.cache.has(trackedRoleID)) {
      const count = messageCounts.get(message.author.id) || 0;
      messageCounts.set(message.author.id, count + 1);
    }
  }
});


setInterval(() => {
  const sortedCounts = Array.from(messageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const notificationChannel = client.channels.cache.get(notificationChannelID);
  if (notificationChannel) {
    const embed = new MessageEmbed()
      .setColor('#3498db')
      .setTitle('Top 3 Message Senders')
      .setDescription(sortedCounts.map(([userID, count], index) => `**${index + 1}.** <@${userID}>: ${count} messages`).join('\n'));

    notificationChannel.send({ embeds: [embed] });
  }

  // Clear message counts after each minute
  messageCounts.clear();
}, 86400000);




// حفظ البيانات إلى ملف عند إيقاف تشغيل البوت
process.on('SIGINT', () => {
  saveData();
  process.exit();
});

process.on('SIGTERM', () => {
  saveData();
  process.exit();
});

function saveData() {
  const dataToSave = Array.from(messageCounts.entries()).reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});

  fs.writeFileSync(databaseFile, JSON.stringify(dataToSave, null, 2));
  console.log('Data saved to Database.json');
}

// استيراد البيانات عند بدء تشغيل البوت
function loadData() {
  if (fs.existsSync(databaseFile)) {
    const data = JSON.parse(fs.readFileSync(databaseFile, 'utf8'));

    for (const [key, value] of Object.entries(data)) {
      messageCounts.set(key, value);
    }

    console.log('Data loaded from Database.json');
  }
}

loadData();

// مسح البيانات من ملف كل يوم
setInterval(() => {
  fs.unlinkSync(databaseFile);
  console.log('Data deleted from Database.json');
}, 86400000);










const cron = require('cron');

const trackedRoleI = '957442638980730934';
const trackedChannelI = '957442641459576871';
const notificationChannelI = '1189610179143147641';
const trackingInterval = 12 * 60 * 60 * 1000; // 12 ساعة بالمللي ثانية

let trackedUsers = {};


client.on('ready', async () => {
  loadStatsFromFile();

  const job = new cron.CronJob('0 23,11 * * *', () => {
    sendNotifications();
  }, null, true, 'Asia/Riyadh'); // تعديل المنطقة الزمنية حسب الحاجة

  job.start();
});

function sendNotifications() {
  const notificationChannel = client.channels.cache.get(notificationChannelI);

  if (notificationChannel) {
    const embed = new MessageEmbed()
      .setTitle('إحصائيات طلب ادمن')
      .setColor('#00ff00')
      .setDescription('إحصائيات كلمة "تفضل" للمستخدمين خلال 12 ساعة :');

    const usersToSend = Object.entries(trackedUsers).map(([userID, userData]) => `<@${userID}>: ${userData.count} مرة`);
    if (usersToSend.length > 0) {
      embed.addField('المستخدمون', usersToSend.join('\n'));
      notificationChannel.send({ embeds: [embed] })
        .then(() => {
          // مسح بيانات الرسائل بعد إرسالها
          trackedUsers = {};
          saveStatsToFile();
        })
        .catch((error) => {
          console.error('Error sending notifications:', error);
        });
    }
  }
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const member = message.guild.members.cache.get(message.author.id);
  const trackedRole = message.guild.roles.cache.get(trackedRoleI);
  const trackedChannel = message.guild.channels.cache.get(trackedChannelI);

  if (member && member.roles.cache.has(trackedRoleI) && message.channel.id === trackedChannelI && message.content.toLowerCase() === 'تفضل') {
    updateStats(message.author.id);
  }
});

function updateStats(userID) {
  if (trackedUsers[userID]) {
    trackedUsers[userID].count++;
  } else {
    trackedUsers[userID] = { count: 1 };
  }

  saveStatsToFile();
}

function saveStatsToFile() {
  fs.writeFileSync('admins.json', JSON.stringify(trackedUsers, null, 2));
}

function loadStatsFromFile() {
  try {
    const data = fs.readFileSync('admins.json');
    trackedUsers = JSON.parse(data);
  } catch (error) {
    console.error('Error loading stats from file:', error);
  }
}















const roleToTriggerIdt = '957442639018491925'; // رقم الرتبة التي تشغل دور المشغل
const targetRoleIdt = '1045047680285560942'; // رقم الرتبة التي سيتم إعطاؤها
const logChannelIdt = '1098239727146119278'; // رقم القناة التي ستتم فيها نشر الرسالة
const messageFormat = `
قائمة بلاك ليست من الوظائف

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

اسم الشخص :  <@{mentionedUser}>

 مدة الإنتهاء : {firstMessage}

 السبب : {secondMessage}

 عصابه / فاكشن / : فاكشن

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

ملاحظة : لا يمكنك ازالة هاذا الحظر بكفالة بل يجب ان تنتظر انتهاء الوقت أو في حال رأيت ان الحظر عن طريق الخطأ فقم بفتح تكت مساعدة
`;

client.on('messageCreate', (message) => {
  // التحقق من صحة الرسالة وصاحبها لديه الرتبة المطلوبة
  if (message.content.startsWith('.fb') && message.member.roles.cache.has(roleToTriggerIdt)) {
    const args = message.content.slice('.fb'.length).trim().split(/ +/);

    // استخراج المستخدم الذي تم الإشارة إليه
    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser) return message.reply('');

    const firstMessage = args[1];
    const secondMessage = args[2];

    // إعطاء الرتبة المستهدفة للشخص المشار إليه
    const targetMember = message.guild.members.cache.get(mentionedUser.id);
    if (targetMember) {
      targetMember.roles.add(targetRoleIdt)
        .then(() => {
          // إرسال الرسالة المنسقة في القناة المخصصة
          const formattedMessage = messageFormat
            .replace('{mentionedUser}', mentionedUser.id)
            .replace('{firstMessage}', firstMessage)
            .replace('{secondMessage}', secondMessage);
          const logChannel = message.guild.channels.cache.get(logChannelIdt);
          if (logChannel) {
            logChannel.send(formattedMessage);
          } else {
            console.error('Could not find log channel.');
          }
        })
        .catch((error) => {
          console.error('Error giving target role:', error);
          message.reply('حدث خطأ أثناء إعطاء الرتبة المستهدفة.');
        });
    } else {
      console.error('Could not find target member.');
      message.reply('حدث خطأ أثناء البحث عن الشخص المستهدف.');
    }
  }
});


const roleToTriggerIdtt = '957442639018491925'; // رقم الرتبة التي تشغل دور المشغل
const targetRoleIdtt = '1086239390080176178'; // رقم الرتبة التي سيتم إعطاؤها
const logChannelIdtt = '1098239727146119278'; // رقم القناة التي ستتم فيها نشر الرسالة
const messageFormatt = `
قائمة بلاك ليست من الوظائف

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

اسم الشخص :  <@{mentionedUser}>

 مدة الإنتهاء : {firstMessage}

 السبب : {secondMessage}

 عصابه / فاكشن / : عصابة

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

ملاحظة : لا يمكنك ازالة هاذا الحظر بكفالة بل يجب ان تنتظر انتهاء الوقت أو في حال رأيت ان الحظر عن طريق الخطأ فقم بفتح تكت مساعدة
`;

client.on('messageCreate', (message) => {
  // التحقق من صحة الرسالة وصاحبها لديه الرتبة المطلوبة
  if (message.content.startsWith('.gb') && message.member.roles.cache.has(roleToTriggerIdtt)) {
    const args = message.content.slice('.gb'.length).trim().split(/ +/);

    // استخراج المستخدم الذي تم الإشارة إليه
    const mentionedUser = message.mentions.users.first();
    if (!mentionedUser) return message.reply('');

    const firstMessage = args[1];
    const secondMessage = args[2];

    // إعطاء الرتبة المستهدفة للشخص المشار إليه
    const targetMember = message.guild.members.cache.get(mentionedUser.id);
    if (targetMember) {
      targetMember.roles.add(targetRoleIdtt)
        .then(() => {
          // إرسال الرسالة المنسقة في القناة المخصصة
          const formattedMessage = messageFormat
            .replace('{mentionedUser}', mentionedUser.id)
            .replace('{firstMessage}', firstMessage)
            .replace('{secondMessage}', secondMessage);
          const logChannel = message.guild.channels.cache.get(logChannelIdtt);
          if (logChannel) {
            logChannel.send(formattedMessage);
          } else {
            console.error('Could not find log channel.');
          }
        })
        .catch((error) => {
          console.error('Error giving target role:', error);
          message.reply('حدث خطأ أثناء إعطاء الرتبة المستهدفة.');
        });
    } else {
      console.error('Could not find target member.');
      message.reply('حدث خطأ أثناء البحث عن الشخص المستهدف.');
    }
  }
});






const factions = ["993806845187727381", "957442638947172360", "1016614759191298089", "957442638825553952", "957442638796161028", "957442638750031889"];
const factionMember = "994009967600336976";

client.on('guildMemberUpdate', (oldMember, newMember) => {
    const oldRoles = oldMember.roles.cache.map(role => role.id);
    const newRoles = newMember.roles.cache.map(role => role.id);

    // Check if the member gained any of the target roles
    const gainedRoles = factions.filter(roleId => !oldRoles.includes(roleId) && newRoles.includes(roleId));

    // Check if the member lost any of the target roles
    const lostRoles = factions.filter(roleId => oldRoles.includes(roleId) && !newRoles.includes(roleId));

    // Assign or remove the faction member role accordingly
    if (gainedRoles.length > 0) {
        newMember.roles.add(factionMember).catch(console.error);
    } else if (lostRoles.length > 0) {
        newMember.roles.remove(factionMember).catch(console.error);
    }
});

const gangs = ["957442638750031883", "957442638712307767", "957442638729068557", "957442638691307577", "957442638649384973", "1011242732116774913"];
const gangMember = "994009963695444099";

client.on('guildMemberUpdate', (oldMember, newMember) => {
    const oldRoles = oldMember.roles.cache.map(role => role.id);
    const newRoles = newMember.roles.cache.map(role => role.id);

    // Check if the member gained any of the target roles
    const gainedRoles = gangs.filter(roleId => !oldRoles.includes(roleId) && newRoles.includes(roleId));

    // Check if the member lost any of the target roles
    const lostRoles = gangs.filter(roleId => oldRoles.includes(roleId) && !newRoles.includes(roleId));

    // Assign or remove the gang member role accordingly
    if (gainedRoles.length > 0) {
        newMember.roles.add(gangMember).catch(console.error);
    } else if (lostRoles.length > 0) {
        newMember.roles.remove(gangMember).catch(console.error);
    }
});



const alchatat = '957442642059337763';
const factiongang = ['994009963695444099', '994009967600336976'];
const timeoutRoleId = '1001811653941280779'; // قم بتغييره إلى ID الرتبة المراد إعطائها

client.on('messageCreate', async (message) => {
  const mentionedRoles = message.mentions.roles;

  // التحقق من أن الرسالة تأتي من قناة ضمن الفئة المعينة وتحتوي على منشن للرتب المستهدفة
  if (
    message.channel.parentId === alchatat &&
    mentionedRoles.some((role) => factiongang.includes(role.id))
  ) {
    // حذف رسالة الشخص
    await message.delete();

    // إعطاء الرتبة المحددة للمستخدم
    const member = message.guild.members.cache.get(message.author.id);
    await member.roles.add(timeoutRoleId);

    // إرسال رسالة توضح السبب للمستخدم
    const replyMessage = `رسالتك انحذفت وجاك ميوت ، ممنوع منشنة الفاكشنات والوزارات هنا`;
    const sentMessage = await message.author.send(replyMessage);

    // حذف رسالة التوضيح بعد 5 ثواني
    sentMessage.delete({ timeout: 5000 });
  }
});



const roleIdArray = ['957442638607446081', '994009967600336976', '957442638607446085', '994009963695444099'];
const notificationChannelId = '957442640520036359';
const cooldownTime = 30 * 60 * 1000; // 30 دقيقة في مللي ثانية

const usersOnCooldown = new Set();

client.on('guildMemberRemove', (member) => {
  if (roleIdArray.some(roleId => member.roles.cache.has(roleId))) {
    const userId = member.id;

    if (!usersOnCooldown.has(userId)) {
      usersOnCooldown.add(userId);

      setTimeout(() => {
        usersOnCooldown.delete(userId);
      }, cooldownTime);

      const notificationChannel = member.guild.channels.cache.get(notificationChannelId);
      if (notificationChannel) {
        notificationChannel.send(`🚨 **تنبيه!** <@${member.user.id}> قام بالخروج والدخول مرة أخرى`);
      }
    }
  }
});




client.on('messageCreate', (message) => {
  if (message.content.toLowerCase() === '.uptime') {
    const response = getInfo(message);
    message.channel.send(response);
  }
});

function getInfo(message) {
  const usedMemory = formatBytes(process.memoryUsage().heapUsed);
  const totalMemory = formatBytes(os.totalmem());
  const freeMemory = formatBytes(os.freemem());
  const totalRam = formatBytes(os.totalmem());
  const usedRam = formatBytes(os.totalmem() - os.freemem());

  const cpuUsage = getCpuUsage();

  const uptime = formatUptime(process.uptime());

  return `**Bot Information:**
- Response Time: ${Date.now() - message.createdTimestamp}ms
- Used Memory: ${usedMemory}
- Total Memory: ${totalMemory}
- Free Memory: ${freeMemory}
- Total RAM: ${totalRam}
- Used RAM: ${usedRam}
- CPU Usage: ${cpuUsage}%
- Uptime: ${uptime}`;
}

function getCpuUsage() {
  const cpus = os.cpus();
  const totalCpu = cpus.reduce((acc, cpu) => acc + (cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq), 0);
  const idleCpu = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);

  const cpuUsagePercent = ((totalCpu - idleCpu) / totalCpu) * 100;

  return cpuUsagePercent.toFixed(2);
}

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round((bytes / Math.pow(1024, i))) + ' ' + sizes[i];
}

function formatUptime(uptime) {
  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / 3600) % 24);
  const days = Math.floor(uptime / 86400);

  return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}


client.login(process.env.token);
