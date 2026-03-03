import axios from "axios";
import { gameState } from "../state/gameState";
import { API } from "../utils/api";
import { getApiErrorMessage } from "../utils/errors";

const SHOP_TYPES = {
  1: "Armas",
  2: "Escudos",
  3: "Armaduras",
  4: "Magias",
  5: "Aneis",
  6: "Consumiveis",
};

function showShop(say) {
  const shopTypeName = SHOP_TYPES[gameState.shopType] || "Desconhecida";
  const lines = [`Loja de ${shopTypeName}:`, `Moedas: ${gameState.moedas}`];

  if (!gameState.shopItems.length) {
    lines.push("Nenhum item disponivel nessa categoria.");
  } else {
    gameState.shopItems.forEach((item, index) => {
      lines.push(`${index + 1} - ${item.nome} (${item.valor} moedas)`);
      lines.push(`    ${item.descricao}`);
    });
  }

  lines.push("Digite o numero do item para comprar ou 'voltar'.");
  say(lines.join("\n"));
}

async function openShopByType(typeInput, say, showShopTypeMenu) {
  const type = Number.parseInt(typeInput, 10);

  if (!Number.isInteger(type) || type < 1 || type > 6) {
    say("Tipo de loja invalido.");
    showShopTypeMenu(say);
    return;
  }

  try {
    const res = await axios.get(`${API}/shop/items`, {
      params: { tipo: type },
    });

    gameState.shopItems = Array.isArray(res.data.items) ? res.data.items : [];
    gameState.shopType = type;
    gameState.moedas = Number(res.data.moedas ?? 0);
    gameState.state = "shop";
    showShop(say);
  } catch (error) {
    const message = getApiErrorMessage(error, "Nao foi possivel abrir a loja.");
    say(message);
    gameState.state = "shop_type";
    showShopTypeMenu(say);
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
    if (Number(selectedItem.tipo) !== 6) {
      gameState.shopItems = gameState.shopItems.filter((item) => item.id !== selectedItem.id);
    }

    say(`Voce comprou ${selectedItem.nome} por ${selectedItem.valor} moedas.`);
    say(`Moedas restantes: ${gameState.moedas}`);
    showShop(say);
  } catch (error) {
    const message = getApiErrorMessage(error, "Nao foi possivel concluir a compra.");
    say(message);
    showShop(say);
  }
}

export async function handleShopTypeInput(cmd, normalized, say, showMainMenu, showShopTypeMenu) {
  if (cmd === "0" || normalized === "voltar") {
    gameState.state = "playing";
    showMainMenu(say);
    return;
  }

  await openShopByType(cmd, say, showShopTypeMenu);
}

export async function handleShopInput(cmd, normalized, say, showShopTypeMenu) {
  if (normalized === "voltar" || normalized === "sair" || cmd === "0") {
    gameState.state = "shop_type";
    showShopTypeMenu(say);
    return;
  }

  await buyShopItem(cmd, say);
}
