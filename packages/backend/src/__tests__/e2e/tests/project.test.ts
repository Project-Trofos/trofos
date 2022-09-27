import { Browser, Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import HomePage from '../pages/HomePage';

jest.setTimeout(60000);

let driver: WebDriver;

beforeEach(async () => {
  if (process.env.CI) {
    driver = await new Builder().forBrowser(Browser.CHROME)
      .setChromeOptions(new chrome.Options()
        .addArguments('--no-sandbox', '--headless')).build();
  } else {
    driver = await new Builder().forBrowser(Browser.CHROME).build();
  }
  driver.manage().setTimeouts({ implicit : 5000 });
});

afterEach(async () => {
  await driver.quit();
});

describe('Projects', () => {

  describe('when the user tries to create/delete a project', () => {

    it('should successfully create/delete the project', async () => {

      const homePage = new HomePage(driver);
      homePage.getPage();

      const loginPage = await homePage.clickLoginButton();
      let projectsPage = await loginPage.loginWithCredentials('testUser@test.com', 'testPassword');

      const numberOfProjectsAtStart = await projectsPage.getNumberOfProjects();
      await projectsPage.createNewProjectWithFields('testProject', 'TEST');
      const numberOfProjectsAfterCreation = await projectsPage.getNumberOfProjects();

      await expect(numberOfProjectsAtStart + 1 === numberOfProjectsAfterCreation);

      const singleProjectPage = await projectsPage.clickOnProjectWithName('testProject');
      projectsPage = await singleProjectPage.deleteProject();

      const numberOfProjectsAfterDeletion = await projectsPage.getNumberOfProjects();

      await expect(numberOfProjectsAtStart === numberOfProjectsAfterDeletion);

      await projectsPage.clickLogoutButton();
    });

  });

  describe('when the user tries to create a backlog', () => {

    it('should successfully create the backlog', async () => {

      const homePage = new HomePage(driver);
      homePage.getPage();

      const loginPage = await homePage.clickLoginButton();
      const projectsPage = await loginPage.loginWithCredentials('testUser@test.com', 'testPassword');

      const singleProjectPage = await projectsPage.clickOnProjectWithName('Backlog test project');
      await singleProjectPage.clickOnBacklogs();

      const numberOfBacklogItemsAtStart = await singleProjectPage.getNumberOfBacklogItems();

      await singleProjectPage.clickOnCreateBacklogButton();
      await singleProjectPage.addBacklogSummary('Test Backlog');
      await singleProjectPage.selectBacklogType('Task');
      await singleProjectPage.selectBacklogSprintId('Sprint 1');
      await singleProjectPage.selectBacklogPriority('High');
      await singleProjectPage.selectBacklogReporter('User1');
      await singleProjectPage.selectBacklogAssignee('User1');
      await singleProjectPage.assignBacklogPoints(4);
      await singleProjectPage.addBacklogDescription('Test Description');
      await singleProjectPage.clickCreateInBacklogForm();

      const numberOfBacklogItemsAtEnd = await singleProjectPage.getNumberOfBacklogItems();
      
      expect(numberOfBacklogItemsAtStart === numberOfBacklogItemsAtEnd + 1);
    });

  });
});