import nusOAUTH2 from './handlers/nus.oauth2';

const commandMap: { [handlerName: string]: any } = {};
commandMap[nusOAUTH2.HANDLER_NAME] = nusOAUTH2.handleLogin;

async function execute(code: string, state: string, callbackUrl: string): Promise<string> {
  const userEmail = await commandMap[state](code, callbackUrl);
  return userEmail;
}

export default {
  execute,
};
