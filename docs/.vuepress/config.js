module.exports = {
    title: 'Slump',
    description: 'Nothing is True, Everything is Permitted',
    dest: './dist',
    port: '7777',
    head: [
        ['link', {rel: 'icon', href: '/logo.jpg'}]
    ],
    markdown: {
        lineNumbers: true
    },
    theme: 'reco',
    themeConfig: {
	subSidebar: 'auto',
	author: 'Connor',
	blogConfig: {
	    java: {
		location: 2,
		text: 'Java'
	    } 
	},
        nav: require('./nav.js'),
	sidebar: require('./sidebar'),
        sidebarDepth: 2,
        lastUpdated: 'Last Updated',
        searchMaxSuggestoins: 10,
        serviceWorker: {
            updatePopup: {
                message: "有新的内容.",
                buttonText: '更新'
            }
        },
        editLinks: true,
        editLinkText: '在 GitHub 上编辑此页 ！'
    }
}

