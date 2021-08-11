const parser = require("node-html-parser")
const services = require("./services.js");
const BASE_IMAGE_URL = "https://pxfnmafyqvdhzxosxcqw.supabase.in/storage/v1/object/public/images/icons/"

async function getCategories() {
    console.clear()
    const html = await services.createRequest()
    if (html) {

        const root = parser.parse(html)
        const categoryList = root.querySelector('ul')
        const categories = Array.from(categoryList.querySelectorAll('li')).map(li => li.textContent.replace(/\d/g, '').trim())
        console.log(categories);
        return categories
    } else {
        console.log("Error getting categories");
        return null
    }
}

async function getApps() {
    const categories = await getCategories()
    if (categories) {
        categories.forEach(async (category) => await getCategoryApps(category))
    }
}

async function getCategoryApps(category) {
    const html = await services.createRequest(`?category=${category.toLowerCase().replace(/\s/, '-')}`)
    const root = parser.parse(html);
    const apps = [];
    const listedApps = root.querySelectorAll('.listed-app');
    listedApps.forEach(app => {
        const name = app.querySelector('.listed-app-name').textContent
        const description = app.querySelector('.listed-app-description').textContent
        const logo = "https://www.electronjs.org" + app.querySelector('.listed-app-logo').getAttribute('data-src')
        const uploadDate = app.querySelector('.listed-app-add-date')?.querySelector('span')?.textContent || ""
        const keywords = app.querySelector('.listed-app-keywords')?.textContent.trim() || ""

        const appInfo = {
            id: name.toLowerCase().replace(/\s/g, '-'),
            name,
            description,
            logo,
            uploadDate,
            keywords
        }
        apps.push(appInfo)
    })
    const categoryInfo = {
        name: category,
        icon: BASE_IMAGE_URL + category.toLowerCase().replace(/\s/g, '-') + '-icon.svg',
        apps
    }
    await services.pushCategoryToDB(categoryInfo)
}


module.exports = {
    getApps
}