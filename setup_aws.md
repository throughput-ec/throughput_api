## Setting up an Application with Amazon AWS and Google Domains

This short document explains how I set up the Annotation Front-end for the ESIP Winter Meeting.  The application has four main components:

1.  An application front-end developed using Vue.js
2.  A graph database powered by neo4j
3.  An API (node.js/express) managing interactions between the database and the application.
4.  A domain (`throughputdb.com`) that will redirect to services as needed.

`neo4j` is a graph database that can be served from cloud services, such as Amazon's Web Services (AWS). The same server that hosts the database can also be used to host the API.  These services would be hosted on an Elastic Compute (EC2) instance, basically a virtual computer.  The Vue.js framework allows individuals to generate webpages that can be hosted as stand-alone pages, and so these can be stored using Amazon's Simple Cloud Storage Service (S3).

AWS can provide public access to data stored in the S3 "buckets", and to data served through EC2, so these can be served to users on the web.  The challenge is that the URLs provided are not always as nice and neat as we'd like them to be.  To manage this we can purchase a domain for our application.  In my case this was done through Google Domains.

So, the workflow is that a user will access the webpage by navigating to `throughputdb.com` or `www.throughputdb.com`, the domain will redirect them to the S3 bucket hosting the website.  The user will interact with a form on the website and hit **Submit**.  The form submission will trigger a call to the API, this will then interact with the database, and return a value to the user through the website.

### What you need to follow this tutorial

This documentation is written mostly for myself, and focuses only on setting up the S3 buckets for the Vue.js application, and their link to the Google domain.  This assumes there is an existing Vuejs project (mine can be cloned from the [throughput_vue GitHub repository](https://github.com/throughput-ec/throughput_vue)) and that Vue.js (and associated node.js installations) are already set up.  This also assumes you have a current installation of Python 3.

This documentation will take you through:

1.  Installing the AWS commandline program.
2.

### Setting up the `aws` commandline program

In Ubuntu we often use `apt` to install applications, however, the `apt` version of `awscli` appears to have some issues related to versions of the packages in the current version of Ubuntu.  To install the command line interface (cli) we need to use the Python version.  We can [install `awscli` using `pip3`](https://docs.aws.amazon.com/cli/latest/userguide/install-linux.html):

```
pip3 install awscli --upgrade --user
```

Once the application is installed using pip3 we need to add the path to the `awscli` program (location can be found using `which aws`) to the server's `PATH`:

```
export PATH="/home/simon/.local/bin/aws:$PATH"
```

Once the application is placed into the `PATH` we can start running the cli to walk through our setup.  The first step is configuring our commandline parameters using [`aws configure`](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) so that the AWS servers know who we are when we send commands to AWS using the CLI.

To be able to configure access you need to create a user in the [IAM Management Console](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html).  I created a user called `Administrator` and added both *Billing* and *AdministratorAccess* permissions.  **BE AWARE**: Following this tutorial sets up applications and services that will potentially cost you money.

Following the guide linked above we can obtain an access key and secret key from the IAM panel for the Administrator, which we then enter when prompted to by the command `aws configure`:

```
$ aws configure
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-west-2
Default output format [None]: json
```

Once the configuration is set up, we can test to make sure that everything is set up properly.  We can check that using:

```
$ aws ec2 describe-regions --output table

----------------------------------------------------------
|                     DescribeRegions                    |
+--------------------------------------------------------+
||                        Regions                       ||
|+-----------------------------------+------------------+|
||             Endpoint              |   RegionName     ||
|+-----------------------------------+------------------+|
||  ec2.ap-south-1.amazonaws.com     |  ap-south-1      ||
||  ec2.eu-west-3.amazonaws.com      |  eu-west-3       ||
||  ec2.eu-north-1.amazonaws.com     |  eu-north-1      ||
||  ec2.eu-west-2.amazonaws.com      |  eu-west-2       ||
||  ec2.eu-west-1.amazonaws.com      |  eu-west-1       ||
||  ec2.ap-northeast-2.amazonaws.com |  ap-northeast-2  ||
...

```

Getting output should indicate that the `aws` cli is accessing the AWS servers and that they are returning data as expected.

## Security Groups

For neo4j to run on the EC2 instance we need to create a security group and a local security key-pair.  We can do this using the commandline, again:

```
export KEY_NAME="annotation_engine"
aws ec2 create-key-pair \
  --key-name $KEY_NAME \
  --query 'KeyMaterial' \
  --output text > $KEY_NAME.pem

export GROUP="annotationEngine"
aws ec2 create-security-group --group-name $GROUP --description "Security group for the neo4j/express API"
```

The security group must allow attachments to port 22, 80 and 443 for (`ssh`, `http` and `https` respectively).

```
for port in 22 7474 7473 7687 80 443; do
  aws ec2 authorize-security-group-ingress --group-name $GROUP --protocol tcp --port $port --cidr 0.0.0.0/0
done
```

Set up instance, using `m3-medium` for the Neo4j server & API.

```
$ aws ec2 run-instances \
  --image-id ami-017da18151f4a38ae \
  --count 1 \
  --instance-type m3.medium \
  --key-name $KEY_NAME \
  --security-groups $GROUP \
  --query "Instances[*].InstanceId" \
  --region us-west-2

[
    "i-0f11e20dd0f288aed"
]
```

With this set up we get a return that indicates the public URL of the new instance:

```
$ aws ec2 describe-instances \
    --instance-ids "i-0f11e20dd0f288aed" \
    --query "Reservations[*].Instances[*].PublicDnsName" \
    --region us-west-2

[
    [
        "ec2-34-219-104-150.us-west-2.compute.amazonaws.com"
    ]
]
```

We can then `ssh` in to the instance:

```
ssh -i $KEY_NAME.pem ubuntu@ec2-34-219-104-150.us-west-2.compute.amazonaws.com
```

At this point in time the remote instance is running, and files have been installed.

## Setting up the API

We need to install some packages:

```
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm install npm -g

sudo apt install git-core
sudo apt update
sudo apt upgrade

```

This may involve updating the grub and `neo4j` configuration options.  I accepted these changes.

Then exit and restart the server before `ssh`ing in again.

```
aws ec2 reboot-instances --instance-ids "i-0f11e20dd0f288aed"
sleep 10
ssh -i $KEY_NAME.pem ubuntu@ec2-34-219-104-150.us-west-2.compute.amazonaws.com
```

Once we're back in we need to set up the directory that will actually serve the API:

```
mkdir server
cd server
git clone https://github.com/throughput-ec/throughput_api.git
```

We also need to add a security rule for port 3000:

```
aws ec2 authorize-security-group-ingress --group-name $GROUP --protocol tcp --port 3000 --cidr 0.0.0.0/0
```

We also need to provide the proper credentials to the application.

## Setting up the Git repository

We set up `git` and `npm` on the remote server by tunnelling in through SSH and then installing node:

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
```

And installing git:

```
sudo apt install git
```

I set up a directory in the home folder for the applications (the Vue app and the Express API) and then clone from the remote directory.

To run the app in the background I need to use `pm2`, which we can install using `npm`:

```
sudo npm install pm2 -g
```

Then, once `pm2` is installed we can start serving the app using:

```
pm2 start app.js
```

## Configuring `neo4j`

The configuration files for Neo4j are found in `/etc/neo4j/neo4j.conf`.  The installation is found in `/var/lib/neo4j`.  When I set up the EC2 server using the AMI image, and then updated everything I ran into an issue where the APOC plugins (in `/var/lib/neo4j/plugins`) were out of date for the current installation.  I needed to navigate to the proper directory and then:

```
```

To allow the browser to accept the connection we need to add a security certificate to connect via HTTPS.  There is [good documentation by David Allen of neo4j for doing this](https://medium.com/neo4j/getting-certificates-for-neo4j-with-letsencrypt-a8d05c415bbd).
