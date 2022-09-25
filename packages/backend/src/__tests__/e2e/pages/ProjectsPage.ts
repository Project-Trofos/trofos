import { WebDriver, By } from 'selenium-webdriver';
import SingleProjectPage from './SingleProjectPage';

export default class ProjectsPage {
  readonly driver : WebDriver;

  constructor(driver : WebDriver) {
    this.driver = driver;
  }

  async createNewProjectWithFields(projectName : string, projectKey : string) {
    await this.driver.findElement(By.xpath("//span[text()='Create Project']")).click();
    await this.driver.switchTo().activeElement();
    await this.driver.findElement(By.css('input#multi-step-modal-form_projectName')).sendKeys(projectName);
    await this.driver.findElement(By.css('input#multi-step-modal-form_projectKey')).sendKeys(projectKey);
    await this.driver.findElement(By.xpath("//span[text()='Next']")).click();
    await this.driver.findElement(By.xpath("//span[text()='Finish']")).click();
  }

  async getNumberOfProjects() : Promise<number> {
    const numberOfProjects = (await this.driver.findElements(By.css('main > div.ant-row > *'))).length;
    return numberOfProjects;
  }

  async clickOnProjectWithName(projectName : string) : Promise<SingleProjectPage> {
    await this.driver.findElement(By.xpath(`//a[text()='${projectName}']`)).click();
    return new SingleProjectPage(this.driver);
  }

  async clickLogoutButton() {
    await this.driver.findElement(By.xpath("//span[text()='Log Out']")).click();
  }
}