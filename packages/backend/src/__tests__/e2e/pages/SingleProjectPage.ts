/* eslint-disable import/no-cycle */
// Page Object Model causes circular imports but its not necessarily bad : https://stackoverflow.com/questions/69651114/how-to-avoid-circular-dependency-when-using-page-objects#comment123113353_69651114
import { WebDriver, By } from 'selenium-webdriver';
import ProjectsPage from './ProjectsPage';

export default class SingleProjectPage {
  readonly driver : WebDriver;

  constructor(driver : WebDriver) {
    this.driver = driver;
  }

  async deleteProject() : Promise<ProjectsPage> {
    const dropdownMenu = await this.driver.findElement(By.css('button.ant-dropdown-trigger'));
    const actions = this.driver.actions({ async : true });
    await actions.move({ origin: dropdownMenu }).press().perform();

    this.driver.switchTo().activeElement();
    await this.driver.findElement(By.xpath("//span[text()='Delete project']")).click();
    this.driver.switchTo().activeElement();
    await this.driver.findElement(By.xpath("//span[text()='OK']")).click();

    return new ProjectsPage(this.driver);
  }

  async clickOnBacklogs() {
    this.driver.findElement(By.xpath("//a[text()='Backlog']")).click();
  }

  async getNumberOfBacklogItems() : Promise<number> {
    const numberOfBacklogItems = (await this.driver.findElements(By.css('ul > *.backlog-card-container'))).length;
    return numberOfBacklogItems;
  }

  async clickOnCreateBacklogButton() {
    await this.driver.findElement(By.xpath("//span[text()='New Backlog']")).click();
    await this.driver.switchTo().activeElement();
  }

  async addBacklogSummary(summary : string) {
    await this.driver.findElement(By.css('input#summary')).sendKeys(summary);
  }

  async selectBacklogType(type : string) {
    await this.driver.findElement(By.xpath("//input[@id='type']")).click();
    await this.driver.findElement(By.xpath(`//div[text()='${type}']`)).click();
  }

  async selectBacklogSprintId(sprintId : string) {
    await this.driver.findElement(By.xpath("//input[@id='sprintId']")).click();
    await this.driver.findElement(By.xpath(`//div[text()='${sprintId}']`)).click();
  }

  async selectBacklogPriority(priority : string) {
    await this.driver.findElement(By.xpath("//input[@id='priority']")).click();
    await this.driver.findElement(By.xpath(`//div[text()='${priority}']`)).click();
  }

  async selectBacklogReporter(reporterId : string) {
    await this.driver.findElement(By.xpath("//input[@id='reporterId']")).click();
    await this.driver.findElement(By.xpath(`//div[@id='reporterId_list']/following-sibling::div//span[text()='${reporterId}']`)).click();
  }

  async selectBacklogAssignee(assigneeId : string) {
    await this.driver.findElement(By.xpath("//input[@id='assigneeId']")).click();
    await this.driver.findElement(By.xpath(`//div[@id='assigneeId_list']/following-sibling::div//span[text()='${assigneeId}']`)).click();
  }

  async assignBacklogPoints(points : number) {
    await this.driver.findElement(By.xpath("//input[@id='points']")).sendKeys(points);
  }

  async addBacklogDescription(description : string) {
    await this.driver.findElement(By.xpath("//textarea[@id='description']")).sendKeys(description);
  }

  async clickCreateInBacklogForm() {
    await this.driver.findElement(By.xpath("//span[text()='Create']")).click();
  }
}