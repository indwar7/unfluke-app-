
const features1 = [
    // {
    //     avatar: 'users',
    //     title: 'Improve Employee Experience',
    //     description:
    //         'Before we dive into why companies must invest in employee experience (EX), it’s important to understand what this concept entails.',
    //     variant: 'primary',
    //     containerClass: 'd-flex border-bottom pb-4',
    // },
    {
        avatar: 'user-plus',
        title: 'Different Segments Charts',
        description: 'Get historical intraday charts of Equity, Futures and Options.',
        variant: 'success',
        containerClass: 'd-flex border-bottom py-4',
    },
    {
        avatar: 'bar-chart',
        title: 'Data since 2017',
        description: 'Currently we have data since 2017 and its updated real time.',
        variant: 'orange',
        containerClass: 'd-flex pt-4',
    },
];


const features2 = [
    // {
    //     avatar: 'users',
    //     title: 'Improve Employee Experience',
    //     description:
    //         'Before we dive into why companies must invest in employee experience (EX), it’s important to understand what this concept entails.',
    //     variant: 'primary',
    //     containerClass: 'd-flex border-bottom pb-4',
    // },
    {
        avatar: 'user-plus',
        title: 'Different Segments Scanner',
        description: 'Check scanner results using a combination of different indicators and time frames.',
        variant: 'success',
        containerClass: 'd-flex border-bottom py-4',
    },
    {
        avatar: 'bar-chart',
        title: 'Data since 2017 for FNO',
        description: 'Get scanner results of even Futures and Options (intraday) since 2017',
        variant: 'orange',
        containerClass: 'd-flex pt-4',
    },
];

const plans = [
    {
        id: 1,
        name: 'Starter',
        price: '49',
        duration: '/ month',
        features: [
            'Up to 600 minutes usage time',
            'Use for personal only',
            'Add up to 10 attendees',
            '1 User',
            'Technical support via email',
        ],
        isRecommended: false,
    },
    {
        id: 2,
        name: 'Professional',
        price: '99',
        duration: '/ month',
        features: [
            'Up to 6000 minutes usage time',
            'Use for personal or a commercial',
            'Add up to 100 attendees',
            'Up to 5 teams',
            'Technical support via email',
        ],
        isRecommended: true,
    },
    {
        id: 3,
        name: 'Enterprise',
        price: '599',
        duration: '/ month',
        features: [
            'Unlimited usage time',
            'Use for personal or a commercial',
            'Add Unlimited attendees',
            '24x7 Technical support via phone',
            'Technical support via email',
        ],
        isRecommended: false,
    },
];

export { features1, features2, plans };
