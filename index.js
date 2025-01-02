var p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("resolved");
  }, 1000);
});

const STATES = {
  pending: "PENDING",
  fulfilled: "FULFILLED",
  rejected: "REJECTED",
};

class MyPromise {
  constructor(callback) {
    this.state = STATES.pending;
    this.value = null;
    this.handlers = [];

    try {
      callback(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  resolve = (value) => {
    this.handleUpdate(value, STATES.fulfilled);
  };

  reject = (value) => {
    this.handleUpdate(value, STATES.rejected);
  };

  handleUpdate = (value, state) => {
    if (state === STATES.pending) {
      return;
    }

    setTimeout(() => {
      if (value instanceof MyPromise) {
        value.then(this.resolve, this.reject);
      }
      this.value = value;
      this.state = state;
      this.executeHandlers();
    }, 0);
  };

  addHandler = (handler) => {
    this.handlers.push(handler);
    this.executeHandlers();
  };

  executeHandlers = () => {
    if (this.state === STATES.pending) {
      return;
    }

    this.handlers.forEach((handler) => {
      if (this.state === STATES.fulfilled) {
        return handler.onSuccess(this.value);
      }

      return handler.onFailure(this.value);
    });
    this.handlers = [];
  };

  then = (onSuccess, onFailure) => {
    return new MyPromise((resolve, reject) => {
      this.addHandler({
        onSuccess: (value) => {
          if (!onSuccess) {
            return resolve(value);
          }

          try {
            return resolve(onSuccess(value));
          } catch (e) {
            reject(e);
          }
        },
        onFailure: (value) => {
          if (!onFailure) {
            return reject(value);
          }
          try {
            return reject(onFailure(value));
          } catch (e) {
            reject(e);
          }
        },
      });
    });
  };

  catch = (onFailure) => {
    return this.then(null, onFailure);
  };

  finally = (callback) => {
    return new MyPromise((resolve, reject) => {
      let value;
      let wasResolved;

      this.then((val) => {
        value = val;
        wasResolved = true;
        return callback();
      }).catch((error) => {
        value = error;
        wasResolved = false;
        return callback();
      });

      if (wasResolved) {
        resolve(value);
      } else {
        reject(value);
      }
    });
  };
}

const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("hello");
  }, 1000);
});
promise.then((value) => {
  console.log(value);
});
