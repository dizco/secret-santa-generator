'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

const expectedH1 = 'Secret Santa Generator';
const expectedTitle = `${expectedH1}`;

describe('Secret Santa Generator', () => {

  beforeAll(() => browser.get(''));

  describe('Dashboard', () => {

    it(`has title '${expectedTitle}'`, () => {
      expect(browser.getTitle()).toEqual(expectedTitle);
    });

    it('has ngx-dashboard', () => {
      const dashboard = element(by.css('.content ngx-dashboard'));
      expect(dashboard.isPresent()).toBeTruthy();
    });

    it('has card', () => {
      const dashboard = element(by.css('.content ngx-dashboard nb-card'));
      expect(dashboard.isPresent()).toBeTruthy();
    });
  });
});
