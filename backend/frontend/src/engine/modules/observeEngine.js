import axios from "axios";
import { gameState } from "../state/gameState";
import { API } from "../utils/api";
import { getApiErrorMessage } from "../utils/errors";

const ITEM_TYPES = {
  1: "Arma",
  2: "Escudo",
  3: "Armadura",
  4: "Magia",
  5: "Anel",
  6: "Consumivel",
};

function showObserveMenu(say) {
  say("Se observar:\n1 - Ver atributos\n2 - Ver inventario (equipar/desequipar)\n0 - Voltar");
}

function showInventory(say) {
  if (!gameState.observeInventoryItems.length) {
    say("Seu inventario esta vazio.");
    say("Digite 'voltar' para retornar.");
    return;
  }

  const lines = ["Inventario:"];

  gameState.observeInventoryItems.forEach((item, index) => {
    const tipo = ITEM_TYPES[item.tipo] || "Desconhecido";
    const equipped = item.equipado ? " [EQUIPADO]" : "";
    const equipableNote = Number(item.tipo) === 6 ? " (nao equipavel)" : "";

    lines.push(
      `${index + 1} - ${item.nome} x${item.quantidade} | ${tipo}${equipableNote}${equipped}`,
    );
    lines.push(`    ${item.descricao}`);
  });

  lines.push("Digite o numero para equipar/desequipar ou 'voltar'.");
  say(lines.join("\n"));
}

async function showAttributes(say) {
  try {
    const res = await axios.get(`${API}/character/attributes`);
    const p = res.data.personagem;
    const equipados = Array.isArray(res.data.equipados) ? res.data.equipados : [];

    const lines = [
      "Atributos do personagem:",
      `Nome: ${p.nome}`,
      `Nivel: ${p.nivel}`,
      `Vida: ${p.vidaatual}/${p.vidamax}`,
      `Mana: ${p.manaatual}/${p.manamax}`,
      `Armadura: ${p.ca}`,
      `Redução de dano: ${p.dr}`,
      `Experiência: ${p.xp}`,
      `Moedas: ${p.moedas}`,
    ];

    if (equipados.length) {
      lines.push("Equipados:");
      equipados.forEach((item) => {
        lines.push(`- ${item.nome} (${ITEM_TYPES[item.tipo] || "Desconhecido"})`);
      });
    } else {
      lines.push("Equipados: nenhum");
    }

    say(lines.join("\n"));
  } catch (error) {
    const message = getApiErrorMessage(error, "Nao foi possivel carregar atributos.");
    say(message);
  }
}

async function openInventory(say) {
  try {
    const res = await axios.get(`${API}/character/inventory`);
    gameState.observeInventoryItems = Array.isArray(res.data.items) ? res.data.items : [];
    gameState.state = "observe_inventory";
    showInventory(say);
  } catch (error) {
    const message = getApiErrorMessage(error, "Nao foi possivel carregar inventario.");
    say(message);
    showObserveMenu(say);
  }
}

async function toggleEquipByIndex(cmd, say) {
  const choice = Number.parseInt(cmd, 10);

  if (!Number.isInteger(choice) || choice < 1 || choice > gameState.observeInventoryItems.length) {
    say("Opcao invalida no inventario.");
    showInventory(say);
    return;
  }

  const selected = gameState.observeInventoryItems[choice - 1];

  if (Number(selected.tipo) === 6) {
    say("Consumiveis nao podem ser equipados.");
    showInventory(say);
    return;
  }

  try {
    const res = await axios.post(`${API}/character/toggle-equip`, {
      item_id: selected.item_id,
    });

    say(res.data.message || "Estado do equipamento atualizado.");
    await openInventory(say);
  } catch (error) {
    const message = getApiErrorMessage(error, "Nao foi possivel alterar equipamento.");
    say(message);
    showInventory(say);
  }
}

export async function handleObserveMenuInput(cmd, normalized, say, showMainMenu) {
  if (cmd === "0" || normalized === "voltar") {
    gameState.state = "playing";
    showMainMenu(say);
    return;
  }

  if (cmd === "1") {
    await showAttributes(say);
    showObserveMenu(say);
    return;
  }

  if (cmd === "2") {
    await openInventory(say);
    return;
  }

  say("Opcao invalida.");
  showObserveMenu(say);
}

export async function handleObserveInventoryInput(cmd, normalized, say) {
  if (cmd === "0" || normalized === "voltar") {
    gameState.state = "observe_menu";
    showObserveMenu(say);
    return;
  }

  await toggleEquipByIndex(cmd, say);
}

export function openObserveMenu(say) {
  gameState.state = "observe_menu";
  showObserveMenu(say);
}

