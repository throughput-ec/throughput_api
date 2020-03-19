## Fixing Audit Fix

When building tools using `node.js`, we use the `npm` package manage to download tool kits from the internet.  These packages help us to undertake certain tasks.  For example the `morgan` package helps log interactions with the Throughput API:

```js
app.use(logger(':date[iso]\t:remote-addr\t:method\t:url\t:status\t:res[content-length]\t:response-time[0]\t:user-agent',
{
    stream: accessLogStream
}))
```

Returns logs that looks something like this:

```
2020-03-17T21:33:14.686Z	::1	GET	/api/ccdr?search=neotoma	200	962	1192	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
2020-03-17T21:33:14.767Z	::1	GET	/favicon.ico	200	1406	3	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
2020-03-17T21:40:59.261Z	::1	GET	/api/metrics/annos	200	230	2055	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
2020-03-18T00:05:39.868Z	::1	GET	/api/metrics/annos/users	-	-	-	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
2020-03-18T00:07:15.567Z	::1	GET	/api/metrics/annos/users	200	128	1251	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36
```

These logs allow us to track how the API is being used.  These logs could be ultimately consumed by a database instance for better analytics, but currently they're being dumped to plain text files.

Each `npm` package wraps code for specific tasks.  The Throughput API uses approximately 17 packages directly, with a total of ~982 packages total (since each of the 17 generally requires another set of packages).  From time to time vulnerabilities are found in the packages, exploits that people could use to harm your server or expose user data.  Since Throughput is a web-facing application we want to minimize the chances of these exploits affecting our servers and our users.

## Auditing Packages

`npm` comes with a tool -- `npm audit` -- that is able to check packages within a project against known exploits and vulnerabilities.  Running `npm audit` at the commandline returns a list of results that look something like this:

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ Low           │ Prototype Pollution                                          │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ minimist                                                     │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=0.2.1 <1.0.0 || >=1.2.3                                    │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ @vue/cli-service [dev]                                       │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ @vue/cli-service > webpack > terser-webpack-plugin > cacache │
│               │ > mkdirp > minimist                                          │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1179                            │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

This tells us how significant the vulnerability is, what type of vunerability it is, and which packages in our installation use the package.

## Automated Fixes

It is often possible to fix some of these issues using `npm audit fix`, which performs the audit and then checks to see if it is possible to update the affected package to correct the problem.

The issue is that, just as we state our package dependencies in our project (in the `package.json` file), each of these packages state their dependencies as well.  It is sometimes the case that a package defines a specific version of an affected package (e.g., `"morgan": "1.9.1"` would indicate that only version `1.9.1` of the `morgan` package can be used).  In this case, if `npm audit` found a vulnerability that affected `morgan` the `npm audit fix` would not be able to update the package without breaking your application (or the package that calls this version of `morgan`).

In this case we would get a result that looks like this:

```
. . .
fixed 2 of 53 vulnerabilities in 26255 scanned packages
  49 vulnerabilities required manual review and could not be updated
  1 package update for 2 vulnerabilities involved breaking changes
```

## Manual Fixes

`npm audit --fix` returns the same list of vulnerabilities as before, but after the first instance of each vulnerability you will see something that looks like this:

```
# Run  npm install --save-dev @vue/cli-plugin-eslint@4.2.3  to resolve 2 vulnerabilities
SEMVER WARNING: Recommended action is a potentially breaking change
```

Here we get a commandline instruction (the `npm install` command) and a warning that we are potentially making a breaking change.  In part, this is why `npm audit fix` wouldn't let us update the package in the first place!  We can use a bit of command line magic to pull out all the different updates we might need to do:

```
npm audit --fix | grep "^#.*"
```

Which, in my case, returns:
```
# Run  npm install --save-dev @vue/cli-plugin-eslint@4.2.3  to resolve 2 vulnerabilities
```

This shows that a single package, and its dependencies is responsible for a number of issues.  For example, in:

```
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ Low           │ Prototype Pollution                                          │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ minimist                                                     │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=0.2.1 <1.0.0 || >=1.2.3                                    │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Dependency of │ @vue/cli-service [dev]                                       │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ @vue/cli-service > webpack-dev-server > chokidar > fsevents  │
│               │ > node-pre-gyp > rc > minimist                               │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ More info     │ https://npmjs.com/advisories/1179                            │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

We can see that the issue is really tied to a single package (`minimist`), but that this issue has been fixed (the `Patched in` section) but that packages that use `minimist` (in this case `rc`) have not updated their dependencies.

If we check the [`npm` package `rc`](https://github.com/dominictarr/rc) it is possible to see that [someone has already made a GitHub Pull Request](https://github.com/dominictarr/rc/pull/114) to fix this issue.  A potential challenge with regards to managing all these packages is that when I looked at `rc` (March 18, 2020) it had been almost two years since the last change to the package.

If the package is no longer maintained, then the issues with the vulnerable package persist in the application ecosystem.  At this point either we need to make a decision to remove the package, or we have to decide that the risk is acceptable.

## Conclusion

A single application, whether the API for Throughput, a commandline application or a single page web app using Vue, is dependent on a number of packages to perform underlying work.  There are always risks associated with the use of other people's work (and with our own work).  Understanding how to assess the risk from the packages you are using, and how to manage issues that cannot be fixed simply using `npm audit fix` will help you maintain safe and reusable software applications.
