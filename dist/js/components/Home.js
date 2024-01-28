import {templates} from '../settings.js';

class Home {
  constructor(element){
    const thisHomePage = this;

    thisHomePage.render(element);
  }

  render(container){
    const thisHomePage = this;

    thisHomePage.dom = {};
    thisHomePage.dom.wrapper = container;

    const generatedHTML = templates.homePage();
    thisHomePage.dom.wrapper.innerHTML = generatedHTML;
  }
}

export default Home;