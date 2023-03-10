export function canDisplay(userActions: string[], allowedActions: string[] | undefined) {
  return userActions?.filter((userAction) => allowedActions?.includes(userAction)).length !== 0;
}

function conditionalRender(
  componentToRender: any,
  userActions: string[],
  allowedActions: string[] | undefined,
  defaultComponent: any = null,
) {
  return canDisplay(userActions, allowedActions) ? componentToRender : defaultComponent;
}

export default conditionalRender;
