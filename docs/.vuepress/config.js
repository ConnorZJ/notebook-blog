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
    themeConfig: {
        nav: [{
            text: 'Java', link: '/java/'
        }],
        sidebar: {'/java/':[
            {
                  title: '集合',
		  path: '/collection/',
                  collapsable: true,
                  children:[
                    {
			title: 'ArrayList',
			path: '/ArrayList.md'
		    }
                  ]
             },
            ]
        },
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

