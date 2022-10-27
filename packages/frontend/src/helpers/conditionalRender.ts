function conditionalRender(componentToRender: any, userActions: string[], allowedActions: string[] | undefined, defaultComponent : any = null) {
  const canDisplay = userActions?.filter((userAction) => allowedActions?.includes(userAction)).length !== 0;
  return canDisplay ? componentToRender : defaultComponent;
}

export default conditionalRender;
