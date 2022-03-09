home = new Vue({
  el: "#app",
  delimiters: ['[[', ']]'],
  mounted() {
    this.getCurrentUser();
    this.getTasks();
    this.calculateColumnBounds();
    window.addEventListener('mousemove', function(event) {
      console.log("Client X:", event.clientX);
      console.log("Client Y:", event.clientY);
    });
  },

  data: {
    user_id: null,
    task: null,
    tasks: [],
    columnBounds: []
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
      this.$buefy.dialog.prompt({
        message: "Task Name",
        inputAttrs: {
          placeholder: 'Enter a task name',
          maxlength: 128,
        },
        trapFocus: true,
        onConfirm: (task) => {
          if (task != null) {
            axios({
              method: 'post',
              url: '/api/tasks/add',
              data: {
                'task': task
              }
            })
            .then(response => {
              if (response.data['status'] == "success") {
                this.tasks.push({name: task, status: "New"});
                task = null;
              }
            })
          }
        }
      })
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
      event.target.addEventListener('mousemove', this.onMouseMove);
    },
    onMouseMove(event) {
      let onMouseMoveX = event.clientX;
      let onMouseMoveY = event.clientY;
      event.target.style.position = 'absolute';
      event.target.style.left = (event.target.boundingRectX + onMouseMoveX
                                 - event.target.onMouseDownX + 'px');
      event.target.style.top = (event.target.boundingRectY + onMouseMoveY
                                - event.target.onMouseDownY - 95 + 'px');
      event.target.addEventListener('mouseup', this.cleanUpListeners);
      event.target.addEventListener('mouseleave', this.cleanUpListeners);
    },
    cleanUpListeners(event) {
      event.target.removeEventListener('mousemove', this.onMouseMove);
      event.target.removeEventListener('mouseup', this.onMouseMove);
      event.target.removeEventListener('mouseleave', this.onMouseMove);
      console.log("Current status:", this.tasks[event.target.index]['status']);
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
        bounds = [elementRect.left, elementRect.right,
                  elementRect.top, elementRect.bottom];
        this.columnBounds.push(bounds);
      }
    }
  }
})

