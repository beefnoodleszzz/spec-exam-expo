import React from 'react';
export const AppRoutes = () => {
  return (
    <>
      <Scene name="Login" component={Login} />
      <Scene name="SimulationTestComponent" component={SimulationTest} />
    </>
  );
}
