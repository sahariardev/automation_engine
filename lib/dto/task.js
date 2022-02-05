class Task {
    constructor(id, prev, next, action) {
        this.id = id;
        this.prev = prev;
        this.next = next;
        this.action = action;
    }

}

module.exports = Task;