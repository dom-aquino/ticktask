home = new Vue({
  el: "#app",
  delimiters: ['[[', ']]'],
  mounted() {
    this.getCurrentUser();
    this.getTasks();
    this.calculateColumnBounds();
  },
  data: {
    user_id: null,
    task: null,
    subtask: null,
    currentTaskIndex: null,
    tasks: [],
    columnBounds: [],
    statuses: ['New', 'In Progress', 'Blocked', 'Done'],
    isModalActive: false,
  },
  methods: {
    getCurrentUser() {
      this.user_id = document.getElementById("user_id").innerText;
    },
    getTasks() {
      axios({
        method: 'get',
        url: '/api/users/' + this.user_id + '/tasks',
      })
      .then(response => {
        this.tasks = response.data['tasks']
      })
    },
    addTask() {
      if (this.task != null) {
        axios({
          method: 'post',
          url: '/api/tasks/add',
          data: {
            'task': this.task
          }
        })
        .then(response => {
          if (response.data['status'] == "success") {
            this.tasks.push({name: this.task, status: "New",
                             subtasks: [], progress: 0});
            this.task = null;
          }
        })
      }
    },
    deleteTask(index) {
      axios({
        method: 'post',
        url: 'api/tasks/delete',
        data: {
          'task': this.tasks[index]
        }
      })
      .then(response => {
        if (response.data['status'] == "success") {
          this.tasks.splice(index, 1);
        }
      })
    },
    updateStatus(index, status) {
      var tempTask = this.tasks[index];
      tempTask['status'] = status;
      axios({
        method: 'put',
        url: 'api/tasks/update',
        data: {
          'task': tempTask
        }
      })
      .then(response => {
        if (response.data['status'] == "success") {
          this.tasks[index] = tempTask;
        }
      })
    },
    onMouseDown(event, index) {
      let onMouseDownX = event.clientX;
      let onMouseDownY = event.clientY;
      let boundingRect = event.target.getBoundingClientRect();

      event.target.boundingRectX = boundingRect.left;
      event.target.boundingRectY = boundingRect.top;
      event.target.onMouseDownX = onMouseDownX;
      event.target.onMouseDownY = onMouseDownY;
      event.target.index = index;
      event.target.isMoved = false;
      event.target.addEventListener('mousemove', this.onMouseMove);
      event.target.addEventListener('mouseup', this.cleanUpListeners);
    },
    onMouseMove(event) {
      let onMouseMoveX = event.clientX;
      let onMouseMoveY = event.clientY;

      if (event.target.isMoved == false) {
        let placeholder = document.createElement("div");
        placeholder.className = "placeholderTaskCard";
        placeholder.style.left = event.target.boundingRectX;
        placeholder.style.top = event.target.boundingRectY;
        event.target.parentNode.appendChild(placeholder);
        event.target.isMoved = true;
      }

      event.target.style.position = 'absolute';
      event.target.style.left = (event.target.boundingRectX + onMouseMoveX
                                 - event.target.onMouseDownX + 'px');
      event.target.style.top = (event.target.boundingRectY + onMouseMoveY
                                - event.target.onMouseDownY - 50 + 'px');
      event.target.addEventListener('mouseup', this.cleanUpListeners);
      event.target.addEventListener('mouseleave', this.cleanUpListeners);
    },
    cleanUpListeners(event) {
      let placeholder = document.querySelector(".placeholderTaskCard");
      if (placeholder) {
        placeholder.remove();
      }
      event.target.removeEventListener('mousemove', this.onMouseMove);
      event.target.removeEventListener('mouseup', this.onMouseMove);
      event.target.removeEventListener('mouseleave', this.onMouseMove);
      if ((this.columnBounds[0][0] < event.clientX) &&
          (this.columnBounds[0][1] > event.clientX) &&
          (this.tasks[event.target.index]['status'] != "New"))
      {
        this.updateStatus(event.target.index, "New");
      }
      else if ((this.columnBounds[1][0] < event.clientX) &&
               (this.columnBounds[1][1] > event.clientX) &&
               (this.tasks[event.target.index]['status'] != "In Progress"))
      {
        this.updateStatus(event.target.index, "In Progress");
      }
      else if ((this.columnBounds[2][0] < event.clientX) &&
               (this.columnBounds[2][1] > event.clientX) &&
               (this.tasks[event.target.index]['status'] != "Blocked"))
      {
        this.updateStatus(event.target.index, "Blocked");
      }
      else if ((this.columnBounds[3][0] < event.clientX) &&
               (this.columnBounds[3][1] > event.clientX) &&
               (this.tasks[event.target.index]['status'] != "Done"))
      {
        this.updateStatus(event.target.index, "Done");
      }
    },
    calculateColumnBounds() {
      let columnNames = ["New", "In Progress", "Blocked", "Done"];
      for (i = 0; i < columnNames.length; ++i) {
        element = document.getElementById(columnNames[i]);
        elementRect = element.getBoundingClientRect();
        this.columnBounds.push([elementRect.left, elementRect.right,
                                elementRect.top, elementRect.bottom]);
      }
    },
    addSubtask(index) {
      this.tasks[index]['subtasks'].push({name: this.subtask, status: false});
      this.subtask = null;
    },
    getProgress() {
      if (this.currentTaskIndex != null) {
        let subtasks = this.tasks[this.currentTaskIndex]['subtasks'];
        let subtasksDone = 0;
        for (const subtask of subtasks) {
          if (subtask['status']) {
            subtasksDone += 1;
          }
        }
        let answer = (subtasksDone / subtasks.length) * 100;
        this.tasks[this.currentTaskIndex]['progress'] = answer;
      }
      return 0;
    }
  }
})

