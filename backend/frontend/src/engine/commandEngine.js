import {
    handleLoginEmail,
    handleLoginOrRegister,
    handleLoginPassword,
    handleRegisterCharacterName,
    handleRegisterEmail,
    handleRegisterName,
    handleRegisterPassword,
    performLogout,
} from "./modules/authEngine";
import { showMainMenu, showShopTypeMenu } from "./modules/menuEngine";
import { handleShopInput, handleShopTypeInput } from "./modules/shopEngine";
import { gameState } from "./state/gameState";

export { gameState } from "./state/gameState";

export async function processInput(inputText, say) {
    const cmd = inputText.trim();
    const normalized = cmd.toLowerCase();

    switch (gameState.state) {
        case "intro":
            say(
                "Bem-vindo, viajante.\nVoce ja esteve nessas terras antes?\nDigite: login ou registrar",
            );
            gameState.state = "login_or_register";
            break;

        // login

        case "login_or_register":
            handleLoginOrRegister(normalized, say);
            break;

        case "login_email":
            handleLoginEmail(cmd, say);
            break;

        case "login_password":
            if (await handleLoginPassword(cmd, say)) {
                showMainMenu(say);
            }
            break;

        case "register_name":
            handleRegisterName(cmd, say);
            break;

        case "register_character_name":
            handleRegisterCharacterName(cmd, say);
            break;

        case "register_email":
            handleRegisterEmail(cmd, say);
            break;

        case "register_password":
            await handleRegisterPassword(cmd, say);
            break;

        // fim login

        case "playing":
            if (cmd === "1") // inspecionar
            {
                say("Template: observacao sera implementada depois.");
                showMainMenu(say);
            } else if (cmd === "2") // combate
            {
                say("Template: combate sera implementado depois.");
                showMainMenu(say);
            } else if (cmd === "3") // loja
            {
                gameState.state = "shop_type";
                showShopTypeMenu(say);
            } else if (cmd === "4") // taverna
            {
                say("Template: taverna sera implementada depois.");
                showMainMenu(say);
            } else if (cmd === "5") // logout
            {
                await performLogout(say);
            } else {
                say("Opcao invalida.");
                showMainMenu(say);
            }
            break;

        case "shop_type":
            await handleShopTypeInput(
                cmd,
                normalized,
                say,
                showMainMenu,
                showShopTypeMenu,
            );
            break;

        case "shop":
            await handleShopInput(cmd, normalized, say, showShopTypeMenu);
            break;

        default:
            say("Estado invalido. Reiniciando fluxo.");
            gameState.state = "intro";
            break;
    }
}
