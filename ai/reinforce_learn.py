import numpy as np
import pandas as pd
import tensorflow.compat.v1 as tf
tf.disable_v2_behavior()
#tf.reset_default_graph() 
import scipy

# DQN off-policy
class DQN:
    def __init__(
            self,
             number_act,
              number_feature,
              learn_ratio = 0.001,
               reward_decay = 0.99,
                e_greedy = 0.9,
                 change_target_iteration = 300,
                  mem_size = 500,
                   batch_size = 2,   
                    e_greedy_increment = None,
                     output_chart = False,
    ):

        self.number_act=number_act
        self.number_feature=number_feature
        self.lr=learn_ratio
        self.gamma=reward_decay
        self.epsilon_max = e_greedy
        self.change_target_iteration = change_target_iteration
        self.mem_size=mem_size
        self.batch_size=batch_size
        self.epsilon_increment=e_greedy_increment
        self.epsilon=0 if e_greedy_increment is not None else self.epsilon_max
        self.save_file='./weights/model.ckpt'

        # total learn steps
        self.learn_step_counter=0

        # initializing 0-memo [s,a,r,s_]
        self.memory=np.zeros( ( self.mem_size,number_feature*2+2 ) )

        # consisting of [ target_network,evaluate_network ]
        self._construct_network()
        t_parameters=tf.get_collection( 'target_network_parameters' )
        e_parameters=tf.get_collection( 'eval_network_parameters' )
        self.replace_target_op=[ tf.assign( t,e ) for t,e in zip( t_parameters,e_parameters ) ]

        #graphic card settings
        configuration=tf.ConfigProto( log_device_placement = False,allow_soft_placement = True )
        configuration.gpu_options.per_process_gpu_memory_fraction=0.6
        self.session=tf.Session( config=configuration )

        if output_chart:
        	tf.summary.FileWriter( "logs/",self.session.graph )

        self.session.run( tf.global_variables_initializer() )
        self.cost_his=[]

    def _construct_network(self):
        # ------------------ constructing of evaluate_network ------------------
        self.s=tf.placeholder( tf.float32,[ None,self.number_feature ],name = 's' )  # input
        self.q_target=tf.placeholder( tf.float32,[ None,self.number_act ],name = 'Q_target' )  # to calculate the loss
        with tf.variable_scope( 'eval_net' ):
            # collections_names are collections for storing the variables
            collections_names,n_l1,w_initializer,b_initializer = \
                [ 'eval_network_parameters',tf.GraphKeys.GLOBAL_VARIABLES ],100, \
                tf.random_normal_initializer( 0.,0.3 ),tf.constant_initializer( 0.1 )  # configuration of layers

            # 1st layer - collection are used later when assigning to the target network
            with tf.variable_scope( 'l1' ,reuse=tf.AUTO_REUSE):
                w1=tf.get_variable( 'w1',[ self.number_feature,n_l1],initializer = w_initializer,collections = collections_names )
                b1=tf.get_variable( 'b1',[ 1,n_l1 ],initializer = b_initializer,collections = collections_names )
                l1=tf.nn.relu( tf.matmul( self.s,w1 )+b1 )

            # 2nd layer - collection are used later when assigning to the target network
            with tf.variable_scope('l2',reuse=tf.AUTO_REUSE):
                w2=tf.get_variable( 'w2',[ n_l1,self.number_act ],initializer = w_initializer,collections = collections_names )
                b2=tf.get_variable( 'b2', [ 1,self.number_act ],initializer = b_initializer,collections = collections_names )
                self.q_eval=tf.matmul( l1,w2 )+b2

        with tf.variable_scope( 'loss' ):
            self.loss=tf.reduce_mean( tf.squared_difference( self.q_target,self.q_eval ) )
        with tf.variable_scope( 'train',reuse=tf.AUTO_REUSE ):
            self._train_op=tf.train.AdamOptimizer( self.lr ).minimize( self.loss )

        # ------------------ constructing the target_network ------------------
        self.s_=tf.placeholder( tf.float32,[ None,self.number_feature ],name = 's_' )    # input
        with tf.variable_scope( 'target_network' ):
            # collections_names are  collections for storing the variables
            collections_names = [ 'target_network_parameters',tf.GraphKeys.GLOBAL_VARIABLES ]

            # 1st layer - collection are used later when assigning to the target network
            with tf.variable_scope( 'l1' ,reuse=tf.AUTO_REUSE):
                w1=tf.get_variable( 'w1',[ self.number_feature,n_l1 ],initializer = w_initializer,collections = collections_names )
                b1=tf.get_variable( 'b1',[ 1,n_l1 ],initializer = b_initializer,collections = collections_names )
                l1=tf.nn.relu( tf.matmul( self.s_,w1 )+b1 )

            # 2nd layer - collection are used later when assigning to the target network
            with tf.variable_scope('l2',reuse=tf.AUTO_REUSE):
                w2=tf.get_variable( 'w2',[ n_l1,self.number_act ],initializer = w_initializer,collections = collections_names )
                b2=tf.get_variable( 'b2',[ 1,self.number_act ],initializer = b_initializer,collections = collections_names )
                self.q_next=tf.matmul( l1, w2 )+b2

    def store_progression( self,s,a,r,s_ ):
        if not hasattr( self,'mem_count'):
            self.mem_count=0
        s = s.reshape( -1 )
        s_= s_.reshape( -1 )
        progression=np.hstack( ( s,[ a,r ],s_ ) )
        
        # alter former mem with recent mem
        index=self.mem_count%self.mem_size
        self.memory[ index,: ]=progression

        self.mem_count+=1

    def select_act( self,investigation ):
        # for having batch dimension when feed into tensorflow placeholder
        investigation=investigation[ np.newaxis,: ]
        if np.random.uniform()<self.epsilon:
            # forward feed investigation, get q value for each act
            acts_value=self.session.run( self.q_eval,feed_dict = { self.s: investigation } )
            act=np.argmax( acts_value )
        else:
            act=np.random.randint( 0,self.number_act )
        return act

    def learn(self):
        if not hasattr( self,'mem_count' ):
            self.mem_count=0
        # check to replace target parameters
        if self.learn_step_counter % self.change_target_iteration==0:
            self.session.run( self.replace_target_op )

        # sample batch memory from all memory
        if self.mem_count>self.mem_size:
            sample_index=np.random.choice( self.mem_size,size = self.batch_size )
        else:
            sample_index=np.random.choice( self.mem_count,size=self.batch_size )
        batch_memory=self.memory[ sample_index,: ]

        q_next,q_eval=self.session.run(
            [ self.q_next,self.q_eval ],
            feed_dict = {
                self.s_: batch_memory[ :,-self.number_feature: ],  # fixed parameters
                self.s: batch_memory[ :,:self.number_feature ],  # newest parameters
            })

        # alter q_target w.r.t q_eval's act
        q_target=q_eval.copy()

        batch_index=np.arange( self.batch_size,dtype = np.int32 )
        eval_act_index=batch_memory[ :,self.number_feature ].astype( int )
        reward=batch_memory[ :,self.number_feature+1 ]

        q_target[ batch_index,eval_act_index ]=reward+self.gamma*np.max( q_next,axis=1 )

        """
        For example in this batch I have 2 samples and 3 acts:
        q_eval =
        [[1, 2, 3],
         [4, 5, 6]]
        q_target = q_eval =
        [[1, 2, 3],
         [4, 5, 6]]
        Then change q_target with the real q_target value w.r.t the q_eval's act.
        For example in:
            sample 0, I took act 0, and the max q_target value is -1;
            sample 1, I took act 2, and the max q_target value is -2:
        q_target =
        [[-1, 2, 3],
         [4, 5, -2]]
        So the (q_target - q_eval) becomes:
        [[(-1)-(1), 0, 0],
         [0, 0, (-2)-(6)]]
        We then backpropagate this error w.r.t the corresponding act to network,
        leave other act as error=0 cause we didn't choose it.
        """

        # training the evaluating net
        _, self.cost=self.session.run( [ self._train_op,self.loss ],
                                     feed_dict = { self.s: batch_memory[ :,:self.number_feature ],
                                                self.q_target: q_target } )
        self.cost_his.append( self.cost )
        # increasing epsilon
        self.epsilon=self.epsilon+self.epsilon_increment if self.epsilon<self.epsilon_max else self.epsilon_max
        self.learn_step_counter+=1

    def cost_plotting( self ):
        import matplotlib.pyplot as plt
        plt.plot( np.arange( len( self.cost_his ) ),self.cost_his )
        plt.ylabel( 'cost' )
        plt.xlabel( 'Train step' )
        plt.savefig( 'cost.png' )
        plt.show()
        
    tf.reset_default_graph()

    def store( self ):
        saver=tf.train.Saver() 
        saver.save( self.session,self.save_file )
    
    def restore( self ):
        saver=tf.train.Saver() 
        saver.restore( self.session,self.save_file )