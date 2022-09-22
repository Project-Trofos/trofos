import { Browser, Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

jest.setTimeout(30000);

let driver: WebDriver;

beforeEach(async () => {
  if (process.env.CI) {
    driver = await new Builder().forBrowser(Browser.CHROME)
      .setChromeOptions(new chrome.Options()
        .addArguments('--no-sandbox', '--headless')).build();
  } else {
    driver = await new Builder().forBrowser(Browser.CHROME).build();
  }
});

afterEach(async () => {
  await driver.quit();
});

describe('Projects', () => {

  describe('when the user tries to create/delete a project', () => {

    it('should successfully create/delete the project', async () => {
      await driver.get('http://localhost:3000');

      // Click login button
      await driver.findElement(By.xpath('//*[@id="root"]/section/section/header/div/div[4]/div/span[2]/a')).click();

      // Enter credentials
      await driver.findElement(By.id('basic_userEmail')).sendKeys('testUser@test.com');
      await driver.findElement(By.id('basic_userPassword')).sendKeys('testPassword');
      await driver.sleep(100);

      // Submit credentials and wait for redirection
      await driver.findElement(By.xpath('//*[@id="basic"]/div[3]/div/div/div/div/button/span')).click();
      await driver.wait(until.urlIs('http://localhost:3000/projects'), 1000);

      const projectCardsAtStart = (await driver.findElements(By.xpath('//*[@id="root"]/section/section/main/main/div[2]/div'))).length;

      // Click create new project
      await driver.findElement(By.xpath('//*[@id="root"]/section/section/main/main/div[1]/button/span')).click();

      // Enter fields for new project
      await driver.findElement(By.xpath('//*[@id="multi-step-modal-form_projectName"]')).sendKeys('testProject');
      await driver.findElement(By.xpath('//*[@id="multi-step-modal-form_projectKey"]')).sendKeys('TEST');
      await driver.sleep(100);

      // Submit fields and wait for redirection
      await driver.findElement(By.xpath('//*[@id="root"]/section/section/main/main/div[1]/div/div[2]/div/div[2]/div[3]/button[2]/span')).click();
      await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('//*[@id="root"]/section/section/main/main/div[1]/div/div[2]/div/div[2]/div[3]/button[2]/span'))));
      await driver.findElement(By.xpath('//*[@id="root"]/section/section/main/main/div[1]/div/div[2]/div/div[2]/div[3]/button[2]/span')).click();
      await driver.wait(until.urlIs('http://localhost:3000/projects'), 1000);

      const projectCardsDuring = (await driver.findElements(By.xpath('//*[@id="root"]/section/section/main/main/div[2]/div'))).length;

      // There should be one more project
      await expect(projectCardsAtStart === projectCardsDuring + 1);

      // Select a project
      await driver.findElement(By.xpath('//*[@id="root"]/section/section/main/main/div[2]/div[5]/div/div/div/div/div[1]/a')).click();
      await driver.wait(until.urlIs('http://localhost:3000/project/4'), 1000);


      // Press the dropdown menu
      const dropdownMenu = driver.findElement(By.xpath('//*[@id="root"]/section/section/main/div/div[1]/span/div/div[2]/button'));
      const actions = driver.actions({ async: true });
      await actions.move({ origin: dropdownMenu }).press().perform();

      // TODO : This should be replaced with a "wait" but I cant get it to work
      await driver.sleep(1000);

      // Click on the delete project button
      await driver.findElement(By.js('return document.querySelector("body > div:nth-child(5) > div > div > ul")')).click();

      // TODO : This should be replaced with a "wait" but I cant get it to work
      await driver.sleep(1000);

      // Confirm deletion and wait for redirection
      await driver.findElement(By.js('return document.querySelector("body > div:nth-child(6) > div > div.ant-modal-wrap > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button.ant-btn.ant-btn-primary")')).click();
      await driver.wait(until.urlIs('http://localhost:3000/projects'), 1000);

      const projectCardsAtEnd = (await driver.findElements(By.xpath('//*[@id="root"]/section/section/main/main/div[2]/div'))).length;

      // Should have the original number of projects
      expect(projectCardsAtStart === projectCardsAtEnd);

      // Click logout button
      await driver.findElement(By.xpath('//*[@id="root"]/section/section/header/div/div[4]/div/span[2]/button')).click();
    });

  });

  describe('when the user tries to create a backlog', () => {

    it('should successfully create the backlog', async () => {
      await driver.get('http://localhost:3000');

      // Click login button
      await driver.findElement(By.xpath('//*[@id="root"]/section/section/header/div/div[4]/div/span[2]/a')).click();

      // Enter credentials
      await driver.findElement(By.id('basic_userEmail')).sendKeys('testUser@test.com');
      await driver.findElement(By.id('basic_userPassword')).sendKeys('testPassword');
      await driver.sleep(100);

      // Submit credentials and wait for redirection
      await driver.findElement(By.xpath('//*[@id="basic"]/div[3]/div/div/div/div/button/span')).click();
      await driver.wait(until.urlIs('http://localhost:3000/projects'), 1000);
      await driver.sleep(1000);

      // Click on the test backlog project and within it, click on backlog
      await driver.findElement(By.js('return document.querySelector("#root > section > section > main > main > div.ant-row > div:nth-child(4) > div > div > div > div > div.ant-card-meta-title > a")')).click();

      const backlogItemsBefore = (await driver.findElements(By.xpath('//*[@id="root"]/section/section/main/section/div/div[2]/div/div/ul/li'))).length;

      await driver.findElement(By.js('return document.querySelector("#rc-tabs-1-tab-2 > a")')).click();
      await driver.findElement(By.xpath('//*[@id="root"]/section/section/main/section/div/div[1]/button')).click();

      // Fill out backlog summary
      await driver.findElement(By.xpath('//*[@id="summary"]')).sendKeys('Test Backlog');

      // Select backlog type
      await driver.findElement(By.xpath('//*[@id="type"]')).click();
      await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath('/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[1]'))));
      await driver.findElement(By.xpath('/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[1]')).click();

      // Select sprint Id
      await driver.findElement(By.xpath('//*[@id="sprintId"]')).click();
      await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath('/html/body/div[4]/div/div/div/div[2]/div[1]/div/div/div'))));
      await driver.findElement(By.xpath('/html/body/div[4]/div/div/div/div[2]/div[1]/div/div/div')).click();

      // Select priority
      await driver.findElement(By.xpath('//*[@id="priority"]')).click();
      await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath('/html/body/div[5]/div/div/div/div[2]/div[1]/div/div/div[1]'))));
      await driver.findElement(By.xpath('/html/body/div[5]/div/div/div/div[2]/div[1]/div/div/div[1]')).click();

      // Select reporter Id
      await driver.findElement(By.xpath('//*[@id="reporterId"]')).click();
      await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath('/html/body/div[6]/div/div/div/div[2]/div[1]/div/div/div[1]'))));
      await driver.findElement(By.xpath('/html/body/div[6]/div/div/div/div[2]/div[1]/div/div/div[1]')).click();

      // Create backlog
      await driver.findElement(By.xpath('/html/body/div[2]/div/div[2]/div/div[2]/div[3]/button')).click();

      const backlogItemsAfter = (await driver.findElements(By.xpath('//*[@id="root"]/section/section/main/section/div/div[2]/div/div/ul/li'))).length;

      // There should be 1 more backlog item than before
      expect(backlogItemsBefore === backlogItemsAfter + 1);
    });

  });
});