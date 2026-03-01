import axios from "axios";

export const gameState = {
  state: "intro",
  typingPassword: false,
  tempName: "",
  tempEmail: "",
  tempPassword: "",
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
        say("Escolha um nome:");
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
          email: gameState.tempEmail,
          password: gameState.tempPassword,
        });

        say("Conta criada com sucesso. Faca login.");
        gameState.typingPassword = false;
        gameState.state = "login_email";
      } catch (error) {
        const message = getApiErrorMessage(error, "Erro ao criar conta.");
        say(`${message} Digite um nome:`);
        gameState.typingPassword = false;
        gameState.state = "register_name";
      }
      break;

    case "playing":
      say("Login concluido. O modulo de jogo sera conectado aqui.");
      break;

    default:
      say("Estado invalido. Reiniciando fluxo.");
      gameState.state = "intro";
      break;
  }
}
