from sklearn import svm
from sklearn import datasets

# read iris dataset
iris = datasets.load_iris()
X, y = iris.data, iris.target

print(iris['DESCR'])

# fit model
clf = svm.SVC(
    C=1.0,
    probability=True,
    random_state=1)
clf.fit(X, y)

print('Training Accuracy: ', clf.score(X, y))

print('Prediction results: ', clf.predict_proba([[5.2,  3.5,  2.4,  1.2]]))
