
function conditionalRender(componentToRender: any, userActions : string[], allowedActions: string[] | undefined) {
    const canDisplay = userActions?.filter(userAction => allowedActions?.includes(userAction)).length !== 0;
    return canDisplay ? componentToRender : null;
}

export default conditionalRender;