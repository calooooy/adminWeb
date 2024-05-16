export const getTopPerforming = () => {
    return fetch('https://dummyjson.com/users')
    .then(res => res.json())
    .then(console.log);
}