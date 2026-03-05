import axios from "axios";
import { gameState } from "../state/gameState";
import { API } from "../utils/api";
import { getApiErrorMessage } from "../utils/errors";

function resetLoginFlow() {
  gameState.typingPassword = false;
  gameState.tempEmail = "";
  gameState.tempPassword = "";
  gameState.state = "login_email";
}

export function handleLoginOrRegister(normalized, say) {
  if (normalized === "login") {
    say("Digite seu email:");
    gameState.state = "login_email";
  } else if (normalized === "registrar") {
    say("Digite o seu nome:");
    gameState.state = "register_name";
  } else {
    say("Nao entendi. Digite login ou registrar.");
  }
}

export function handleLoginEmail(cmd, say) {
  if (!cmd) {
    say("Email vazio. Digite seu email:");
    return;
  }

  gameState.tempEmail = cmd;
  gameState.typingPassword = true;
  say("Digite sua senha:");
  gameState.state = "login_password";
}

export async function handleLoginPassword(cmd, say) {
  if (!cmd) {
    say("Senha vazia. Digite sua senha:");
    return false;
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
    return true;
  } catch (error) {
    const message = getApiErrorMessage(error, "Credenciais invalidas.");
    say(`${message} Tente novamente. Digite seu email:`);
    resetLoginFlow();
    return false;
  }
}

export function handleRegisterName(cmd, say) {
  if (!cmd) {
    say("Nome vazio. Digite um nome:");
    return;
  }

  gameState.tempName = cmd;
  say("Agora escolha o nome do seu personagem:");
  gameState.state = "register_character_name";
}

export function handleRegisterCharacterName(cmd, say) {
  if (!cmd) {
    say("Nome do personagem vazio. Digite um nome para o personagem:");
    return;
  }

  gameState.tempCharacterName = cmd;
  say("Digite seu email:");
  gameState.state = "register_email";
}

export function handleRegisterEmail(cmd, say) {
  if (!cmd) {
    say("Email vazio. Digite seu email:");
    return;
  }

  gameState.tempEmail = cmd;
  gameState.typingPassword = true;
  say("Crie uma senha:");
  gameState.state = "register_password";
}

export async function handleRegisterPassword(cmd, say) {
  if (!cmd) {
    say("Senha vazia. Crie uma senha:");
    return;
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
}

export async function performLogout(say) {
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
  gameState.shopType = null;
  gameState.moedas = 0;
  gameState.state = "login_or_register";
  say("Logout realizado.");
  say("Digite: login ou registrar");
}

