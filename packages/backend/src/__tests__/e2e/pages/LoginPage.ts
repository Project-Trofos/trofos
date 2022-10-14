import { WebDriver, By } from 'selenium-webdriver';
import ProjectsPage from './ProjectsPage';

export default class LoginPage {
  readonly driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async loginWithCredentials(email: string, password: string): Promise<ProjectsPage> {
    await this.driver.findElement(By.id('basic_userEmail')).sendKeys(email);
    await this.driver.findElement(By.id('basic_userPassword')).sendKeys(password);
    await this.driver.findElement(By.xpath("//span[text()='Submit']")).click();
    return new ProjectsPage(this.driver);
  }
}
