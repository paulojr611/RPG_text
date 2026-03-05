import axios from "axios";
import { gameState } from "../state/gameState";
import { API } from "../utils/api";
import { getApiErrorMessage } from "../utils/errors";

const ITEM_TYPES = {
    1: "Arma",
    2: "Escudo",
    3: "Armadura",
    4: "Acessorio",
    5: "Magia",
    6: "Consumivel",
};

const EQUIPMENT_TYPES = {
    1: "Armas",
    2: "Escudos",
    3: "Armaduras",
    4: "Acessorios",
};

const EQUIPMENT_TYPE_TO_ITEM_TYPE = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
};

function showObserveMenu(say) {
    say("Se observar:\n1 - Ver atributos\n2 - Abrir inventario\n0 - Voltar");
}

function showInventoryRootMenu(say) {
    say(
        "Inventario:\n1 - Ver equipamentos\n2 - Ler o grimorio\n3 - Ver a mochila\n0 - Voltar",
    );
}

function showEquipmentTypeMenu(say) {
    say(
        "Equipamentos:\n1 - Ver armas\n2 - Ver escudos\n3 - Ver armaduras\n4 - Ver acessorios\n0 - Voltar",
    );
}

function getItemsByType(itemType) {
    return gameState.observeInventoryItems.filter(
        (item) => Number(item.tipo) === itemType,
    );
}

function showEquipmentList(say) {
    const selectedType = gameState.observeEquipmentType;
    const itemType = EQUIPMENT_TYPE_TO_ITEM_TYPE[selectedType];
    const categoryLabel = EQUIPMENT_TYPES[selectedType] || "Equipamentos";
    const items = getItemsByType(itemType);

    if (!items.length) {
        say(`${categoryLabel}: nenhum item encontrado.`);
        say("Digite 'voltar' para escolher outro tipo.");
        return;
    }

    const lines = [`${categoryLabel}:`];

    items.forEach((item, index) => {
        const equipped = item.equipado ? " [EQUIPADO]" : "";
        lines.push(`${index + 1} - ${item.nome}${equipped}`);
        lines.push(`    ${item.descricao}`);
    });

    lines.push("Digite o numero para equipar/desequipar ou 'voltar'.");
    say(lines.join("\n"));
}

function showGrimoire(say) {
    const spells = getItemsByType(5);

    if (!spells.length) {
        say("Grimorio vazio.");
        say("Digite 'voltar' para retornar.");
        return;
    }

    const lines = ["Grimorio:"];

    spells.forEach((item, index) => {
        lines.push(`${index + 1} - ${item.nome}`);
        lines.push(`    ${item.descricao}`);
    });

    lines.push("Digite 'voltar' para retornar.");
    say(lines.join("\n"));
}

function showBackpack(say) {
    const consumables = getItemsByType(6);

    if (!consumables.length) {
        say("Mochila vazia.");
        say("Digite 'voltar' para retornar.");
        return;
    }

    const lines = ["Mochila:"];

    consumables.forEach((item, index) => {
        // Quantity is shown only for consumables.
        lines.push(`${index + 1} - ${item.nome} x${item.quantidade}`);
        lines.push(`    ${item.descricao}`);
    });

    lines.push("Digite 'voltar' para retornar.");
    say(lines.join("\n"));
}

async function showAttributes(say) {
    try {
        const res = await axios.get(`${API}/character/attributes`);
        const p = res.data.personagem;
        const equipados = Array.isArray(res.data.equipados)
            ? res.data.equipados
            : [];

        const lines = [
            "Atributos do personagem:",
            `Nome: ${p.nome}`,
            `Nivel: ${p.nivel}`,
            `Vida: ${p.vidaatual}/${p.vidamax}`,
            `Mana: ${p.manaatual}/${p.manamax}`,
            `Bonus de acerto: ${p.bonusacerto}`,
            `Dano: ${p.danomin} - ${p.danomax}`,
            `Armadura: ${p.ca}`,
            `Reducao de dano: ${p.dr}`,
            `Experiencia: ${p.xp}`,
            `Moedas: ${p.moedas}`,
        ];

        if (equipados.length) {
            lines.push("Equipados:");
            equipados.forEach((item) => {
                lines.push(
                    `- ${item.nome} (${ITEM_TYPES[item.tipo] || "Desconhecido"})`,
                );
            });
        } else {
            lines.push("Equipados: nenhum");
        }

        say(lines.join("\n"));
    } catch (error) {
        const message = getApiErrorMessage(
            error,
            "Nao foi possivel carregar atributos.",
        );
        say(message);
    }
}

async function refreshInventory(say, fallbackState = "observe_menu") {
    try {
        const res = await axios.get(`${API}/character/inventory`);
        gameState.observeInventoryItems = Array.isArray(res.data.items)
            ? res.data.items
            : [];
        return true;
    } catch (error) {
        const message = getApiErrorMessage(
            error,
            "Nao foi possivel carregar inventario.",
        );
        say(message);
        gameState.state = fallbackState;
        if (fallbackState === "observe_menu") {
            showObserveMenu(say);
        } else if (fallbackState === "observe_inventory_menu") {
            showInventoryRootMenu(say);
        } else if (fallbackState === "observe_equipment_type") {
            showEquipmentTypeMenu(say);
        } else if (fallbackState === "observe_equipment_list") {
            showEquipmentList(say);
        }
        return false;
    }
}

async function toggleEquipmentByIndex(cmd, say) {
    const selectedType = gameState.observeEquipmentType;
    const itemType = EQUIPMENT_TYPE_TO_ITEM_TYPE[selectedType];
    const equipmentItems = getItemsByType(itemType);
    const choice = Number.parseInt(cmd, 10);

    if (
        !Number.isInteger(choice) ||
        choice < 1 ||
        choice > equipmentItems.length
    ) {
        say("Opcao invalida nos equipamentos.");
        showEquipmentList(say);
        return;
    }

    const selected = equipmentItems[choice - 1];

    try {
        const res = await axios.post(`${API}/character/toggle-equip`, {
            item_id: selected.item_id,
        });

        say(res.data.message || "Estado do equipamento atualizado.");
        if (await refreshInventory(say, "observe_equipment_list")) {
            showEquipmentList(say);
        }
    } catch (error) {
        const message = getApiErrorMessage(
            error,
            "Nao foi possivel alterar equipamento.",
        );
        say(message);
        showEquipmentList(say);
    }
}

export async function handleObserveMenuInput(
    cmd,
    normalized,
    say,
    showMainMenu,
) {
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
        if (await refreshInventory(say)) {
            gameState.state = "observe_inventory_menu";
            showInventoryRootMenu(say);
        }
        return;
    }

    say("Opcao invalida.");
    showObserveMenu(say);
}

export async function handleInventoryRootInput(cmd, normalized, say) {
    if (cmd === "0" || normalized === "voltar") {
        gameState.state = "observe_menu";
        showObserveMenu(say);
        return;
    }

    if (cmd === "1") {
        gameState.state = "observe_equipment_type";
        showEquipmentTypeMenu(say);
        return;
    }

    if (cmd === "2") {
        gameState.state = "observe_grimoire";
        showGrimoire(say);
        return;
    }

    if (cmd === "3") {
        gameState.state = "observe_backpack";
        showBackpack(say);
        return;
    }

    say("Opcao invalida.");
    showInventoryRootMenu(say);
}

export function handleEquipmentTypeInput(cmd, normalized, say) {
    if (cmd === "0" || normalized === "voltar") {
        gameState.state = "observe_inventory_menu";
        showInventoryRootMenu(say);
        return;
    }

    const choice = Number.parseInt(cmd, 10);

    if (!Number.isInteger(choice) || choice < 1 || choice > 4) {
        say("Opcao invalida.");
        showEquipmentTypeMenu(say);
        return;
    }

    gameState.observeEquipmentType = choice;
    gameState.state = "observe_equipment_list";
    showEquipmentList(say);
}

export async function handleEquipmentListInput(cmd, normalized, say) {
    if (cmd === "0" || normalized === "voltar") {
        gameState.state = "observe_equipment_type";
        showEquipmentTypeMenu(say);
        return;
    }

    await toggleEquipmentByIndex(cmd, say);
}

export function handleReadOnlyInventoryInput(normalized, say, stateToReturn) {
    if (normalized === "voltar" || normalized === "0") {
        gameState.state = stateToReturn;
        showInventoryRootMenu(say);
        return;
    }

    say("Digite 'voltar' para retornar.");
}

export function openObserveMenu(say) {
    gameState.state = "observe_menu";
    showObserveMenu(say);
}
