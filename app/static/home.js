home = new Vue({
  el: "#app",
  delimiters: ['[[', ']]'],
  mounted() {
    this.getCurrentUser();
    this.getTasks();
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
  },
})

