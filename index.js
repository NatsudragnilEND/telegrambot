const { Telegraf } = require("telegraf");
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
const supabaseUrl = "https://lgbnsbrrybyfdqkkchpm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYm5zYnJyeWJ5ZmRxa2tjaHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0OTEzOTUsImV4cCI6MjA0NzA2NzM5NX0.De-PqHbs_65H8oQcNuFYDLC3YI-H7IpFDEipxgh_g2g";
const supabase = createClient(supabaseUrl, supabaseKey);

const botToken = "7831120296:AAEUYrbzyZDhpAH7-TaLt1gzAAuv7vwrxQM";
const bot = new Telegraf(botToken);

const userStates = {};

const askName = async (ctx) => {
  await ctx.reply("😁👋 Привет! Давай познакомимся! \n\nКак тебя зовут? ", {
    reply_markup: { force_reply: true },
  });
};

const askBirthYear = async (ctx) => {
  await ctx.reply("🎉 В каком году ты родился? 😄", {
    reply_markup: { force_reply: true },
  });
};

const askSex = async (ctx) => {
  await ctx.reply("✨ Какой у тебя пол? 😄", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Мужской", callback_data: "male" }],
        [{ text: "Женский", callback_data: "female" }],
        [{ text: "Другой", callback_data: "other" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const askdatingpreference = async (ctx) => {
  await ctx.reply("😉✨ С кем ты хочешь общаться? 😄", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Мужчины", callback_data: "male" }],
        [{ text: "Женщины", callback_data: "female" }],
        [{ text: "Все", callback_data: "both" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const askPhoto = async (ctx) => {
  await ctx.reply("🤩📸 Отлично! А можешь прислать свою фотографию?  ", {
    reply_markup: { force_reply: true },
  });
};

const askDescription = async (ctx) => {
  await ctx.reply("😉💬 Расскажи немного о себе! ", {
    reply_markup: { force_reply: true },
  });
};

const askHeight = async (ctx) => {
  await ctx.reply("📏 Какой у тебя рост? 😄", {
    reply_markup: { force_reply: true },
  });
};

const askStatus = async (ctx) => {
  await ctx.reply("😁✨ Выберите вашу цель знакомства:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Общение без конкретики", callback_data: "casual" }],
        [{ text: "Серьезные отношения", callback_data: "serious" }],
        [{ text: "Дружба", callback_data: "friendship" }],
        [{ text: "Свидание", callback_data: "dating" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const askLocation = async (ctx) => {
  await ctx.reply("🗺 Отлично! А можешь прислать свое местоположение? 😉", {
    reply_markup: {
      keyboard: [
        [{ text: "Отправить местоположение", request_location: true }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
};

const getPhotoUrl = async (fileId) => {
  const fileInfo = await bot.telegram.getFile(fileId);
  return `https://api.telegram.org/file/bot${botToken}/${fileInfo.file_path}`;
};

bot.on("callback_query", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];
  const selectedData = ctx.callbackQuery.data;

  if (userState) {
    if (userState.state === "sex" && userState.editingField !== "sex") {
      const sexMap = {
        male: "Мужской",
        female: "Женский",
        other: "Другой",
      };

      userState.sex = sexMap[selectedData];
      await ctx.answerCbQuery();
      await ctx.reply(`😁👌 Пол установлен: ${userState.sex} 😄`);
      userState.state = "datingpreference";
      await askdatingpreference(ctx);
    } else if (userState.state === "datingpreference" && userState.editingField !== "datingpreference") {
      const preferenceMap = {
        male: "Мужчины",
        female: "Женщины",
        both: "Все",
      };

      userState.datingpreference = preferenceMap[selectedData];
      await ctx.answerCbQuery();
      await ctx.reply(`😁👌 Предпочтение установлено: ${userState.datingpreference} 😄`);
      userState.state = "photo";
      await askPhoto(ctx);
    } else if (userState.state === "status" && userState.editingField !== "status") {
      const statusMap = {
        casual: "Общение без конкретики",
        serious: "Серьезные отношения",
        friendship: "Дружба",
        dating: "Свидание",
      };

      userState.status = statusMap[selectedData];
      await ctx.answerCbQuery();
      await ctx.reply(`😁👌 Цель знакомства установлена: ${userState.status} 😄`);
      userState.state = "location";
      await askLocation(ctx);
    } else if (userState.state === "edit_profile" && userState.editingField === "sex") {
      const sexMap = {
        male: "Мужской",
        female: "Женский",
        other: "Другой",
      };

      const newSex = sexMap[selectedData];

      await supabase
        .from("users")
        .update({ sex: newSex })
        .eq("telegram_id", userId)
        .then(() => {
          ctx.answerCbQuery();
          ctx.reply("✨ Пол успешно изменен! 😄");
          delete userStates[userId];
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          ctx.reply("😱😔 Произошла ошибка при изменении пола! 😔 ");
        });
    } else if (userState.state === "edit_profile" && userState.editingField === "datingpreference") {
      const preferenceMap = {
        male: "Мужчины",
        female: "Женщины",
        both: "Все",
      };

      const newPreference = preferenceMap[selectedData];

      await supabase
        .from("users")
        .update({ datingpreference: newPreference })
        .eq("telegram_id", userId)
        .then(() => {
          ctx.answerCbQuery();
          ctx.reply("✨ Предпочтение успешно изменено! 😄");
          delete userStates[userId];
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          ctx.reply("😱😔 Произошла ошибка при изменении предпочтения! 😔 ");
        });
    } else if (userState.state === "edit_profile" && userState.editingField === "status") {
      const statusMap = {
        casual: "Общение без конкретики",
        serious: "Серьезные отношения",
        friendship: "Дружба",
        dating: "Свидание",
      };

      const newStatus = statusMap[selectedData];

      await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("telegram_id", userId)
        .then(() => {
          ctx.answerCbQuery();
          ctx.reply("✨ Цель знакомства успешно изменена! 😄");
          delete userStates[userId];
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          ctx.reply("😱😔 Произошла ошибка при изменении цели знакомства! 😔 ");
        });
    }
  }
});
bot.start((ctx) => {
  ctx.reply(
    "😁👋 Привет! Я помогу тебе найти новые знакомства! \n\n" +
      "Чтобы зарегистрироваться, введи команду /register "
  );
});

bot.command("register", async (ctx) => {
  const userId = ctx.from.id;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", userId);

    if (user?.[0]) {
      await ctx.reply(
        "😉💬 Ты уже зарегистрирован! \n\nЧтобы посмотреть свой профиль, введи /profile "
      );
      return;
    } else {
      let userState = { state: "name" };
      userStates[userId] = userState;
      await askName(ctx);
    }
  } catch (error) {
    console.error("Error checking registration status:", error);
    await ctx.reply("😱😔 Произошла ошибка при проверке регистрации! Попробуйте снова. 😔");
  }
});

bot.command("profile", async (ctx) => {
  const userId = ctx.from.id;
  await displayProfile(ctx, userId);
});

bot.command("edit_profile", async (ctx) => {
  const userId = ctx.from.id;
  await editProfile(ctx, userId);
});
bot.command("delete_profile", async (ctx) => {
  const userId = ctx.from.id;
  userStates[userId] = { state: "delete_confirmation" };
  await ctx.reply(
    "😱😔 Ты уверен, что хочешь удалить свой профиль? \n\n" +
      "Если ты уверен, введи /confirm_delete. 😔 "
  );
});

bot.command("confirm_delete", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];

  if (userState && userState.state === "delete_confirmation") {
    await deleteProfile(ctx, userId);
    delete userStates[userId];
  } else {
    await ctx.reply("😱😔 Произошла ошибка! Попробуйте снова. 😔");
  }
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "😁👋 Доступные команды:\n\n" +
      "/register - Зарегистрироваться в боте.\n" +
      "/profile - Просмотреть свой профиль.\n" +
      "/edit_profile - Изменить информацию в профиле.\n" +
      "/delete_profile - Удалить профиль.\n"
  );
});

bot.hears("Имя", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];
  userState.state = "edit_profile";
  if (userState && userState.state === "edit_profile") {
    userState.editingField = "name";
    await ctx.reply("💬 Введите новое имя:", {
      reply_markup: { force_reply: true },
    });
  }
});

bot.hears("Возраст", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];

  if (userState && userState.state === "edit_profile") {
    userState.editingField = "age";
    await ctx.reply("🎉 Введите новый год рождения:", {
      reply_markup: { force_reply: true },
    });
  }
});

bot.hears("Пол", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];

  if (userState && userState.state === "edit_profile") {
    userState.editingField = "sex";
    await ctx.reply("✨ Выберите новый пол:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Мужской", callback_data: "male" }],
          [{ text: "Женский", callback_data: "female" }],
          [{ text: "Другой", callback_data: "other" }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }
});

bot.hears("С кем ты хочешь общаться?", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];

  if (userState && userState.state === "edit_profile") {
    userState.editingField = "datingpreference";
    await ctx.reply("😉✨ Выберите с кем вы хотите общаться:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Мужчины", callback_data: "male" }],
          [{ text: "Женщины", callback_data: "female" }],
          [{ text: "Все", callback_data: "both" }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }
});

bot.hears("Фото", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];

  if (userState && userState.state === "edit_profile") {
    userState.editingField = "photo";
    await ctx.reply("📸 Отправьте новое фото:", {
      reply_markup: { force_reply: true },
    });
  }
});

bot.hears("Описание", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];

  if (userState && userState.state === "edit_profile") {
    userState.editingField = "description";
    await ctx.reply("💬 Введите новое описание:", {
      reply_markup: { force_reply: true },
    });
  }
});

bot.hears("Рост", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];

  if (userState && userState.state === "edit_profile") {
    userState.editingField = "height";
    await ctx.reply("📏 Введите новый рост:", {
      reply_markup: { force_reply: true },
    });
  }
});

bot.hears("Цель знакомства", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];

  if (userState && userState.state === "edit_profile") {
    userState.editingField = "status";
    await ctx.reply("😁✨ Выберите новую цель знакомства:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Общение без конкретики", callback_data: "casual" }],
          [{ text: "Серьезные отношения", callback_data: "serious" }],
          [{ text: "Дружба", callback_data: "friendship" }],
          [{ text: "Свидание", callback_data: "dating" }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }
});

bot.hears("Местоположение", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];

  if (userState && userState.state === "edit_profile") {
    userState.editingField = "location";
    await ctx.reply("🗺 Отправьте новое местоположение:", {
      reply_markup: {
        keyboard: [
          [{ text: "Отправить местоположение", request_location: true }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }
});

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];
  await updateLastSeen(userId);
  if (userState && userState.state !== "edit_profile") {
    await handleRegistrationResponse(ctx, userId);
  } else if (userState && userState.state === "edit_profile") {
    await handleEditProfileResponse(ctx, userId);
  }
});
const updateLastSeen = async (userId) => {
  try {
    await supabase
      .from("users")
      .update({ last_seen: new Date() })
      .eq("telegram_id", userId);
  } catch (error) {
    console.error("Error updating last_seen:", error);
  }
};
const handleRegistrationResponse = async (ctx, userId) => {
  const userState = userStates[userId];
  const text = ctx.message?.text;

  if (userState) {
    switch (userState.state) {
      case "name":
        userState.name = text;
        userState.state = "birthYear";
        await askBirthYear(ctx);
        break;

      case "birthYear":
        const birthYear = parseInt(text, 10);
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        if (isNaN(birthYear) || age < 18 || age > 100 || birthYear > currentYear) {
          await ctx.reply("😱😔 Некорректный год рождения. Пожалуйста, введите год от 18 до 100 лет назад. 😔");
          return;
        }
        userState.age = birthYear; //Store birth year in age field.
        userState.state = "sex";
        await askSex(ctx);
        break;

      case "sex":
        userState.state = "datingpreference";
        await askdatingpreference(ctx);
        break;

      case "datingpreference":
        userState.state = "photo";
        await askPhoto(ctx);
        break;

      case "photo":
        if (ctx.message.photo) {
          const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
          userState.photo = await getPhotoUrl(fileId);
          userState.photo_file_id = fileId;
          userState.state = "description";
          await askDescription(ctx);
        } else {
          await ctx.reply("📸 Пожалуйста, отправь фотографию! 📸");
        }
        break;

      case "description":
        userState.description = text;
        userState.state = "height";
        await askHeight(ctx);
        break;

      case "height":
        const height = parseFloat(text);
        if (isNaN(height) || height < 50 || height > 250) {
          await ctx.reply("😱😔 Рост должен быть числом от 50 до 250. 😔");
          return;
        }
        userState.height = height;
        userState.state = "status";
        await askStatus(ctx);
        break;

      case "status":
        userState.state = "location";
        await askLocation(ctx);
        break;
      case "location":
        await registerUser(ctx, userId, userState);
        delete userStates[userId];
        break;

      default:
        await ctx.reply("😱😔 Произошла ошибка! Попробуйте снова. 😔");
        break;
    }
  }
};

const handleEditProfileResponse = async (ctx, userId) => {
  const userState = userStates[userId];
  const text = ctx.message.text;
  const editingField = userState.editingField;

  if (userState) {
    switch (editingField) {
      case "name":
        await supabase
          .from("users")
          .update({ name: text })
          .eq("telegram_id", userId)
          .then(() => {
            ctx.reply("✨ Имя успешно изменено! 😄");
            delete userStates[userId];
          })
          .catch((error) => {
            console.error("Error updating user:", error);
            ctx.reply("😱😔 Произошла ошибка при изменении имени! 😔 ");
          });
        break;

      case "age":
        const birthYear = parseInt(text, 10);
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        if (isNaN(birthYear) || age < 18 || age > 100 || birthYear > currentYear) {
          await ctx.reply("😱😔 Некорректный год рождения. Пожалуйста, введите год от 18 до 100 лет назад. 😔");
          return;
        }
        await supabase
          .from("users")
          .update({ age: birthYear })
          .eq("telegram_id", userId)
          .then(() => {
            ctx.reply("🎉 Год рождения успешно изменен! 😄");
            delete userStates[userId];
          })
          .catch((error) => {
            console.error("Error updating user:", error);
            ctx.reply("😱😔 Произошла ошибка при изменении года рождения! 😔 ");
          });
        break;

      case "description":
        await supabase
          .from("users")
          .update({ description: text })
          .eq("telegram_id", userId)
          .then(() => {
            ctx.reply("💬 Описание успешно изменено! 😄");
            delete userStates[userId];
          })
          .catch((error) => {
            console.error("Error updating user:", error);
            ctx.reply("😱😔 Произошла ошибка при изменении описания! 😔 ");
          });
        break;

      case "height":
        const height = parseFloat(text);
        if (isNaN(height) || height < 50 || height > 250) {
          await ctx.reply("😱😔 Рост должен быть числом от 50 до 250. 😔");
          return;
        }
        await supabase
          .from("users")
          .update({ height: height })
          .eq("telegram_id", userId)
          .then(() => {
            ctx.reply("📏 Рост успешно изменен! 😄");
            delete userStates[userId];
          })
          .catch((error) => {
            console.error("Error updating user:", error);
            ctx.reply("😱😔 Произошла ошибка при изменении роста! 😔 ");
          });
        break;

      default:
        await ctx.reply("😱😔 Произошла ошибка! Попробуйте снова. 😔");
        break;
    }
  }
};

const registerUser = async (ctx, userId, userState) => {
  try {
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        telegram_id: userId,
        name: userState.name,
        age: userState.age, // Birth year
        sex: userState.sex,
        datingpreference: userState.datingpreference,
        photo: userState.photo,
        description: userState.description,
        height: userState.height,
        location: userState.location,
        status: userState.status,
        rating: 5,
        premium: false,
        photo_file_id: userState.photo_file_id,
      });

    if (insertError) {
      console.error("Error registering user:", insertError);
      await ctx.reply("😱😔 Произошла ошибка при регистрации! Попробуйте снова. 😔");
    } else {
      await ctx.replyWithHTML(
        `😁👋 Добро пожаловать, ${userState.name}! Ты успешно зарегистрирован! 😄\n\n` +
          `Перейдите в наше мини-приложение, чтобы начать знакомиться:`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "открыть приложение",
                  web_app: { url: `https://frontend-mu-flame.vercel.app/register/${userId}` },
                },
              ],
            ],
          },
        }
      );

      delete userStates[userId];
    }
  } catch (error) {
    console.error("Error registering user:", error);
    await ctx.reply("😱😔 Произошла ошибка при регистрации! Попробуйте снова. 😔");
  }
};

const displayProfile = async (ctx, userId) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", userId);

    if (error) {
      console.error("Error fetching user profile:", error);
      await ctx.reply("😱😔 Произошла ошибка при загрузке профиля! 😔 ");
      return;
    }

    if (user[0]) {
      const {
        name,
        age, //Birth Year
        sex,
        datingpreference,
        photo,
        description,
        height,
        location,
        status,
        photo_file_id,
        photo_url,
      } = user[0];

      const locationCoords = location.match(/\(([^,]+),([^)]+)\)/);
      const longitude = locationCoords ? locationCoords[1] : "";
      const latitude = locationCoords ? locationCoords[2] : "";

      let country = "";
      let city = "";
      if (longitude && latitude) {
        const response = await axios.get(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );

        if (response.data) {
          country = response.data.countryName || "";
          city = response.data.city || response.data.locality || "";
        }
      }

      let profileText = `<b>${name}</b> \n\n`;
      profileText += `🎉 Год рождения: ${age} \n\n`; //Display Birth Year
      profileText += `✨ Пол: ${sex} \n\n`;
      profileText += `😉✨ Предпочтение: ${datingpreference} \n\n`;
      profileText += `💬 Описание: ${description} \n\n`;
      profileText += `📏 Рост: ${height} \n\n`;
      if (country || city) {
        profileText += `🗺 Местоположение: ${city ? `${city}, ` : ""}${country} (<a href="https://www.google.com/maps?q=${latitude},${longitude}">карта</a>) \n\n`;
      } else {
        profileText += `🗺 Местоположение: ${location} \n\n`;
      }

      profileText += `✨ Цель знакомства: ${status} \n\n`;

      if (photo_url) {
        await ctx.replyWithPhoto(photo_url, {
          caption: profileText,
          parse_mode: "HTML",
        });
      } else if (photo_file_id) {
        await ctx.sendPhoto(photo_file_id, {
          caption: profileText,
          parse_mode: "HTML",
        });
      } else {
        await ctx.reply(profileText, { parse_mode: "HTML" });
      }
    } else {
      await ctx.reply("😱😔 Профиль не найден! 😔 ");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    await ctx.reply("😱😔 Произошла ошибка при загрузке профиля! 😔 ");
  }
};

const editProfile = async (ctx, userId) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", userId);

    if (error) {
      console.error("Error fetching user profile:", error);
      await ctx.reply("😱😔 Произошла ошибка при загрузке профиля! 😔 ");
      return;
    }

    if (user[0]) {
      userStates[userId] = { state: "edit_profile", userId };
      await ctx.reply("✨ Что ты хочешь изменить? 😄 ", {
        reply_markup: {
          keyboard: [
            [{ text: "Имя" }],
            [{ text: "Возраст" }],
            [{ text: "Пол" }],
            [{ text: "С кем ты хочешь общаться?" }],
            [{ text: "Фото" }],
            [{ text: "Описание" }],
            [{ text: "Рост" }],
            [{ text: "Цель знакомства" }],
            [{ text: "Местоположение" }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    } else {
      await ctx.reply("😱😔 Профиль не найден! 😔 ");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    await ctx.reply("😱😔 Произошла ошибка при загрузке профиля! 😔 ");
  }
};

bot.on("photo", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];

  if (userState) {
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const photoUrl = await getPhotoUrl(fileId);

    if (userState.state === "photo" && userState.editingField !== "photo") {
      userState.photo = photoUrl;
      userState.photo_file_id = fileId;
      userState.state = "description";
      await askDescription(ctx);
    } else if (userState.state === "edit_profile" && userState.editingField === "photo") {
      await supabase
        .from("users")
        .update({ photo: photoUrl, photo_file_id: fileId })
        .eq("telegram_id", userId)
        .then(() => {
          ctx.reply("📸 Фотография успешно изменена! 😄");
          delete userStates[userId];
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          ctx.reply("😱😔 Произошла ошибка при изменении фотографии! 😔 ");
        });
    }
  }
});

bot.on("location", async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates[userId];

  if (userState) {
    const location = `(${ctx.message.location.longitude},${ctx.message.location.latitude})`;

    if (userState.state === "location" && userState.editingField !== "location") {
      userState.location = location;
      await registerUser(ctx, userId, userState);
      delete userStates[userId];
    } else if (userState.state === "edit_profile" && userState.editingField === "location") {
      await supabase
        .from("users")
        .update({ location: location })
        .eq("telegram_id", userId)
        .then(() => {
          ctx.reply("🗺 Местоположение успешно изменено! 😄");
          delete userStates[userId];
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          ctx.reply("😱😔 Произошла ошибка при изменении местоположения! 😔 ");
        });
    }
  }
});

const deleteProfile = async (ctx, userId) => {
  try {
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("telegram_id", userId);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      await ctx.reply("😱😔 Произошла ошибка при удалении профиля! 😔 ");
    } else {
      await ctx.reply("✨ Профиль успешно удален! 😄 ");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    await ctx.reply("😱😔 Произошла ошибка при удалении профиля! 😔 ");
  }
};

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));