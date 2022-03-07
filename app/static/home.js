home = new Vue({
  el: "#app",
  delimiters: ['[[', ']]'],
  mounted() {
    this.getCurrentUser();
    this.getTasks();
    window.addEventListener('mousemove', function(event) {
      console.log("Client X:", event.clientX);
      console.log("Client Y:", event.clientY);
    });
    window.addEventListener('mouseup', this.removeMoveListener);
  },
  data: {
    user_id: null,
    task: null,
    tasks: []
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
    onMouseDown(event) {
      let onMouseDownX = event.clientX;
      let onMouseDownY = event.clientY;
      let boundingRect = event.target.getBoundingClientRect();

      let newCol = document.getElementById("New");
      let newRect = newCol.getBoundingClientRect();
      let inProgressCol = document.getElementById("In Progress");
      let inProgressRect = inProgressCol.getBoundingClientRect();

      event.target.style.position = 'absolute';
      event.target.addEventListener('mousemove', this.onMouseMove);
      event.target.boundingRectX = boundingRect.left;
      event.target.boundingRectY = boundingRect.top;
      event.target.onMouseDownX = onMouseDownX;
      event.target.onMouseDownY = onMouseDownY;
      event.target.newRect = newRect;
      event.target.inProgressRect = inProgressRect;

      console.log("New Rect Left:", newRect.left);
      console.log("New Rect Right:", newRect.right);
      console.log("In Progress Rect Left:", inProgressRect.left);
      console.log("In Progress Rect Right:", inProgressRect.right);
    },
    onMouseMove(event) {
      let onMouseMoveX = event.clientX;
      let onMouseMoveY = event.clientY;
      event.target.style.left = (event.target.boundingRectX + onMouseMoveX
                                 - event.target.onMouseDownX + 'px');;
      event.target.style.top = (event.target.boundingRectY + onMouseMoveY
                                 - event.target.onMouseDownY - 95 + 'px');
      console.log("Mouse Move X:", onMouseMoveX);
      if ((event.target.newRect.left < onMouseMoveX) && (onMouseMoveX < event.target.newRect.right)) {
        event.target.style.background = "blue";
      }
      else if ((event.target.inProgressRect.left < onMouseMoveX) && (onMouseMoveX < event.target.inProgressRect.right)) {
        event.target.style.background = "yellow";
      }
      else {
        event.target.style.background = "black";
      }
    },
    removeMoveListener(event) {
      box = document.getElementById("myBox");
      box.removeEventListener('mousemove', this.onMouseMove);
    }
  }
})

