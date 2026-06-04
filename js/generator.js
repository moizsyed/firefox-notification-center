let idNext = 0;

const generateId = () => {
    return ++idNext;
}

const createEntry = (title, preview) => {
    const base = document.createElement('li');
    const titleElement = document.createElement('b');
    titleElement.appendChild(document.createTextNode(title));
    base.appendChild(titleElement);
    base.appendChild(document.createElement('br'));
    base.appendChild(document.createTextNode(preview));
    return base;
}

const generateMessageGenerator = async (sourceUrl) => {
    const utf8Decoder = new TextDecoder("utf-8");
    const response = await fetch(sourceUrl);
    if (!response.ok) {
        console.error("Oops");
    }
    const reader = response.body.getReader();
    const contentBytes = await reader.read();
    let content = utf8Decoder.decode(contentBytes.value);
    return () => {
        const index = content.indexOf('.');
        const currentValue = content.substring(0, index+1).trim();
        content = content.substring(index+1);
        return currentValue;
    }
};


export const createNotificationSource = async (sourceId, sourceUrl, intervalMillis, callback) => {
    const generator = await generateMessageGenerator(sourceUrl);

    setInterval(() => {
        console.log("Hey there");
    callback({
                id: generateId(),
                src: sourceId,
                when: new Date(),
                unread: true,
                isNew: true,
                title: generator(),
                preview: generator(),
            });
        }, intervalMillis);
};

createNotificationSource("nyt", 'http://localhost:3000/frankenstein.txt', 5000, (item) => {
    window.NOTIFS.push(item);
});
