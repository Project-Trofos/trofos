export const withInjection = (WrappedComponent: any) => {
  return (props: any) => {
    // Render the wrapped component with additional props or modifications
    return <WrappedComponent {...props} />;
  };
};
