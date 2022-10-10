import { By, WebDriver } from 'selenium-webdriver';
import LoginPage from './LoginPage';

export default class HomePage {
  readonly driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async getPage() {
    await this.driver.get('http://localhost:3000');
  }

  async clickLoginButton(): Promise<LoginPage> {
    await this.driver.findElement(By.css("a[href='/login']")).click();
    return new LoginPage(this.driver);
  }
}
