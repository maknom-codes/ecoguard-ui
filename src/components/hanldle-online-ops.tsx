import React from "react";
import * as serviceWorkerRegistration from '../service-worker-registration';

export const Demarrage = ({ children} :{ children: React.JSX.Element}) => {

  const registerServiceWorker = () => {
      serviceWorkerRegistration.register();
  };

  React.useEffect(() => {
    registerServiceWorker();
  },[])

  return <>{ children }</>
};