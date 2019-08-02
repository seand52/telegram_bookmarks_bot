const { titles } = require("../constants");

class Logic {
  getCategories(callBackDataType) {
    const categories = Object.keys(titles).map(item => ({
      text: titles[item],
      callback_data: `${callBackDataType} ${titles[item]}`
    }));

    //split array in two halfs for multiline keyborad output
    const midPoint = Math.floor(categories.length / 2);
    let arrayFirstHalf = categories.slice(0, midPoint);
    let arraySecondHalf = categories.slice(midPoint, categories.length);
    return [arrayFirstHalf, arraySecondHalf];
  }

  setBookMarkData(model, { results, siteUrl, keyboardResponse, userId }) {
    model.push().set({
      name: results.data.ogSiteName,
      title: results.data.ogTitle,
      description: results.data.ogDescription,
      url: siteUrl,
      thumbnail: results.data.ogImage.url,
      category: keyboardResponse,
      index: `${userId}-${keyboardResponse}`,
      userId
    });
  }


}

module.exports = Logic;
