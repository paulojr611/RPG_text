import axios from "axios";

export const gameState = {
  state: "intro",
  typingPassword: false,
  tempName: "",
  tempCharacterName: "",
  tempEmail: "",
  tempPassword: "",
  shopItems: [],
  moedas: 0,
};

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function resetLoginFlow() {
  gameState.typingPassword = false;
  gameState.tempEmail = "";
  gameState.tempPassword = "";
  gameState.state = "login_email";
}

function getApiErrorMessage(error, fallbackMessage) {
  const apiMessage = error?.response?.data?.message;
  const apiError = error?.response?.data?.error;
  const validationErrors = error?.response?.data?.errors;

  if (typeof apiError === "string" && apiError.length > 0) {
    return apiError;
  }

  if (typeof apiMessage === "string" && apiMessage.length > 0) {
    return apiMessage;
  }

  if (validationErrors && typeof validationErrors === "object") {
    const firstKey = Object.keys(validationErrors)[0];
    if (firstKey && Array.isArray(validationErrors[firstKey]) && validationErrors[firstKey][0]) {
      return validationErrors[firstKey][0];
    }
  }

  return fallbackMessage;
}

function showMenu(say) {
  say(
    "Escolha uma opcao:\n1 - Se observar\n2 - Ir para combate\n3 - Ir para loja\n4 - Ir para taverna\n5 - Deslogar",
  );
}

function showShop(say) {
  const lines = ["Loja:", `Moedas: ${gameState.moedas}`];

  if (!gameState.shopItems.length) {
    lines.push("Nenhum item disponivel no momento.");
  } else {
    gameState.shopItems.forEach((item, index) => {
      lines.push(`${index + 1} - ${item.nome} (${item.valor} moedas)`);
      lines.push(`    ${item.descricao}`);
    });
  }

  lines.push("Digite o numero do item para comprar ou 'voltar'.");
  say(lines.join("\n"));
}

async function openShop(say) {
  try {
    const res = await axios.get(`${API}/shop/items`);
    gameState.shopItems = Array.isArray(res.data.items) ? res.data.items : [];
    gameState.moedas = Number(res.data.moedas ?? 0);
    gameState.state = "shop";
    showShop(say);
  } catch (error) {
    const message = getApiErrorMessage(error, "Nao foi possivel abrir a loja.");
    say(message);
    showMenu(say);
  }
}

async function buyShopItem(indexInput, say) {
  const choice = Number.parseInt(indexInput, 10);

  if (!Number.isInteger(choice) || choice < 1 || choice > gameState.shopItems.length) {
    say("Opcao invalida na loja.");
    showShop(say);
    return;
  }

  const selectedItem = gameState.shopItems[choice - 1];

  try {
    const res = await axios.post(`${API}/shop/buy`, {
      item_id: selectedItem.id,
      quantidade: 1,
    });

    gameState.moedas = Number(res.data.moedas_restantes ?? gameState.moedas);
    say(`Voce comprou ${selectedItem.nome} por ${selectedItem.valor} moedas.`);
    say(`Moedas restantes: ${gameState.moedas}`);
    showShop(say);
  } catch (error) {
    const message = getApiErrorMessage(error, "Nao foi possivel concluir a compra.");
    say(message);
    showShop(say);
  }
}

async function performLogout(say) {
  try {
    await axios.post(`${API}/logout`);
  } catch {
    // Even if API logout fails, local session must be cleared.
  }

  localStorage.removeItem("token");
  delete axios.defaults.headers.common.Authorization;
  gameState.typingPassword = false;
  gameState.tempEmail = "";
  gameState.tempPassword = "";
  gameState.shopItems = [];
  gameState.moedas = 0;
  gameState.state = "login_or_register";
  say("Logout realizado.");
  say("Digite: login ou registrar");
}

export async function processInput(inputText, say) {
  const cmd = inputText.trim();
  const normalized = cmd.toLowerCase();

  switch (gameState.state) {
    case "intro":
      say("Bem-vindo, viajante.\nVoce ja esteve nessas terras antes?\nDigite: login ou registrar");
      gameState.state = "login_or_register";
      break;

    case "login_or_register":
      if (normalized === "login") {
        say("Digite seu email:");
        gameState.state = "login_email";
      } else if (normalized === "registrar") {
        say("Digite o seu nome:");
        gameState.state = "register_name";
      } else {
        say("Nao entendi. Digite login ou registrar.");
      }
      break;

    case "login_email":
      if (!cmd) {
        say("Email vazio. Digite seu email:");
        break;
      }

      gameState.tempEmail = cmd;
      gameState.typingPassword = true;
      say("Digite sua senha:");
      gameState.state = "login_password";
      break;

    case "login_password":
      if (!cmd) {
        say("Senha vazia. Digite sua senha:");
        break;
      }

      gameState.tempPassword = cmd;
      say("Autenticando...");

      try {
        const res = await axios.post(`${API}/login`, {
          email: gameState.tempEmail,
          password: gameState.tempPassword,
        });

        localStorage.setItem("token", res.data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
        say(`Bem-vindo de volta, ${res.data.user.name}.`);
        gameState.typingPassword = false;
        gameState.state = "playing";
        showMenu(say);
      } catch (error) {
        const message = getApiErrorMessage(error, "Credenciais invalidas.");
        say(`${message} Tente novamente. Digite seu email:`);
        resetLoginFlow();
      }
      break;

    case "register_name":
      if (!cmd) {
        say("Nome vazio. Digite um nome:");
        break;
      }

      gameState.tempName = cmd;
      say("Agora escolha o nome do seu personagem:");
      gameState.state = "register_character_name";
      break;

    case "register_character_name":
      if (!cmd) {
        say("Nome do personagem vazio. Digite um nome para o personagem:");
        break;
      }

      gameState.tempCharacterName = cmd;
      say("Digite seu email:");
      gameState.state = "register_email";
      break;

    case "register_email":
      if (!cmd) {
        say("Email vazio. Digite seu email:");
        break;
      }

      gameState.tempEmail = cmd;
      gameState.typingPassword = true;
      say("Crie uma senha:");
      gameState.state = "register_password";
      break;

    case "register_password":
      if (!cmd) {
        say("Senha vazia. Crie uma senha:");
        break;
      }

      gameState.tempPassword = cmd;
      say("Criando conta...");

      try {
        await axios.post(`${API}/register`, {
          name: gameState.tempName,
          character_name: gameState.tempCharacterName,
          email: gameState.tempEmail,
          password: gameState.tempPassword,
        });

        say("Conta criada com sucesso. Faca login, digite seu email:");
        gameState.typingPassword = false;
        gameState.tempEmail = "";
        gameState.state = "login_email";
      } catch (error) {
        const message = getApiErrorMessage(error, "Erro ao criar conta.");
        say(`${message} Digite um nome:`);
        gameState.typingPassword = false;
        gameState.state = "register_name";
      }
      break;

    case "playing":
      if (cmd === "1") {
        say("Template: observacao sera implementada depois.");
        showMenu(say);
      } else if (cmd === "2") {
        say("Template: combate sera implementado depois.");
        showMenu(say);
      } else if (cmd === "3") {
        await openShop(say);
      } else if (cmd === "4") {
        say("Template: taverna sera implementada depois.");
        showMenu(say);
      } else if (cmd === "5") {
        await performLogout(say);
      } else {
        say("Opcao invalida.");
        showMenu(say);
      }
      break;

    case "shop":
      if (normalized === "voltar" || normalized === "sair" || cmd === "0") {
        gameState.state = "playing";
        showMenu(say);
      } else {
        await buyShopItem(cmd, say);
      }
      break;

    default:
      say("Estado invalido. Reiniciando fluxo.");
      gameState.state = "intro";
      break;
  }
}
