/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
export const environment = {
  production: true,
  analytics: {
    enabled: true,
    trackingId: 'UA-44227081-15',
  },
  oidc: {
    authority: 'https://kiosoft.us.auth0.com',
    clientId: 'sfqzaCHN23kSo5TPjeTKHAu13hKPj86v',
  },
  recaptcha: {
    siteKey: '6LeCVDIUAAAAAMQBTyx-BZ8DCbD3caY8r145qC46',
  },
  mailServerUrl: 'https://kiosoft.ca',
  appName: 'secret-santa-generator',
};
