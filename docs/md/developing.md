# Developing

This project implements a [Vagrant](http://vagrantup.com) development 
environment.  Vagrant allows developers running any major operating 
system to easily reproduce specifically tailored development 
environments with a few simple commands.

You will need to ensure that Vagrant and Virtualbox are both installed
before continuing.

## Starting Up

First, checkout the repository:

```shell
> git clone git@github.com:lukes/lukes-jsdoc.git
```

Next, execute Vagrant:

```shell
> vagrant up
```

A new virtual machine will load and run through a series of scripts.  
Once it has finished you can SSH into the new machine like so:

```shell
> vagrant ssh
```

You can also use your favorite SSH client (we use Putty) to connect to 
the VM. Take note of the Vagrant boot log to find the SSH port:

```shell
==> default: Waiting for machine to boot. This may take a few minutes...
    default: SSH address: 127.0.0.1:2201
```

Above we can see that our VM is available at `localhost` (aka 
`127.0.0.1`) port `2201`.

When connecting to the VM you should use the `vagrant` user with the 
[public Vagrant key](https://github.com/mitchellh/vagrant/blob/master/keys/vagrant).
You will usually want to configure your SSH client to automatically 
execute `sudo su` and `cd /project` upon connect, but how to do that is 
beyond the scope of this documentation.

### Line Endings

Vagrant is _supposed_ to automatically convert line endings when you 
map a drive from a windows host (which uses `\r\n`) to a linux guest 
(which uses `\n`). When Vagrant fails to do that for one or more 
provisioning scripts, you may get errors during booting and provisioning 
that look like this:

```shell
==> default: /project/env/vagrant/provision/_paths.sh: line 2: $'\r': command not found
==> default: /project/env/vagrant/provision/_paths.sh: line 8: $'\r': command not found
```

To get passed this error you need to convert the line endings of the 
provisioning file and run provisioning again.  There are about a dozen 
ways to do that, but this is the easiest way I've found (starting from 
the host shell):

```shell
F:\Projects\lukes-jsdoc>vagrant ssh
[vagrant@lukes-jsdoc ~]$ sudo su
[root@lukes-jsdoc vagrant]# yum install -y dos2unix
   ...
[root@lukes-jsdoc vagrant]# cd /vagrant/env/vagrant
[root@lukes-jsdoc vagrant]# dos2unix *
   ...
[root@lukes-jsdoc vagrant]# cd /vagrant/env/vagrant/provision
[root@lukes-jsdoc vagrant]# dos2unix *
   ...
[root@lukes-jsdoc vagrant]# /vagrant/env/vagrant/provision.sh
   ...
```

I am sure there is a more elegant or permanent approach and I will 
research that eventually and include it here.

## Development

With your Vagrant VM loaded and connected, you can begin development.  
First, Vagrant should have automatically mapped the `/project` directory 
to the `lukes-jsdoc` directory on your PC (the host).  This allows you
to use any editor you'd like to update the source files.  You can also
use your host to execute git commands.

The Vagrant VM shows its usefulness in the context of development
scripts.

In many of our projects we use [`Grunt`](http://gruntjs.com) to assist
in some of the more complex build operations.  Even when we do, we try
to use "npm scripts" as a foundation for all development scripts.

This project doesn't use Grunt (at least not yet) but does still have
development scripts.  They are all in `/scripts` and can be executed
using the `npm run` command.

More documentation for those scripts will be added as needed and as time
permits, but you can get a summary of what's available by looking at
`package.json` under the `scripts: {}` section.  They should all be
self-explanatory.

As a quick example, to execute a script named `build`, you would type
the following into your Vagrant shell/ssh.

```shell
[vagrant@lukes-jsdoc ~]$ sudo su
[root@lukes-jsdoc vagrant]# cd /project
[root@lukes-jsdoc project]# npm run-script build
```
