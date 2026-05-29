export function HomeStructuredData() {
    const combinedSchema = [
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MWareX",
            "url": "https://mwarex.in",
            "logo": {
                "@type": "ImageObject",
                "url": "https://mwarex.in/mwarexlogo.png"
            },
            "founder": {
                "@type": "Person",
                "name": "Samay Samrat",
                "url": "https://mwarex.in/founder",
                "image": "https://mwarex.in/images/samay-samrat.jpg",
                "jobTitle": "Founder & CEO",
                "sameAs": [
                    "https://www.youtube.com/@futxsamay",
                    "https://twitter.com/ChemistGamer1",
                    "https://github.com/samay-hash",
                    "https://www.instagram.com/chemist.gamer"
                ]
            },
            "description": "India's first scalable middleware platform for content creators and editors. Founded by Samay Samrat.",
            "sameAs": [
                "https://twitter.com/mwarex",
                "https://github.com/samay-hash/mwarex.in"
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://mwarex.in",
            "name": "MWareX",
            "description": "The ultimate platform for YouTubers and editors to collaborate seamlessly.",
            "publisher": {
                "@type": "Person",
                "name": "Samay Samrat"
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://mwarex.in/?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
            }
        }
    ];

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
        />
    );
}
