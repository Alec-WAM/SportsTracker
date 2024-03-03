export function deepCopy(object: any): any {
    return JSON.parse(JSON.stringify(object));
}