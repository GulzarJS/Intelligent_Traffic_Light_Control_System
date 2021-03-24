import numpy as np
import gym
from reinforce_learn import DQN
import argparse
import matplotlib.pyplot as plt
import pickle
import gzip

np.set_printoptions( threshold = np.inf )

parser = argparse.ArgumentParser( description = 'Train or test neural network motor controller.' )
parser.add_argument( '--train',dest = 'train',action = 'store_true',default = False )
parser.add_argument( '--test',dest = 'test',action = 'store_true',default = True )
args = parser.parse_args()

def environment_initialization():
    num_cars_road1 = 0
    num_cars_road2 = 0
    state = 0
    return num_cars_road1, num_cars_road2, state

step_set = []
reward_set = []

if args.train:
    ReinforceLearn = DQN( number_act = 2,number_feature = 3, 
                  learn_ratio = 0.01,e_greedy = 0.9, 
                  change_target_iteration = 100,mem_size = 2000, 
                  e_greedy_increment = 0.001, )

    num_cars_road1, num_cars_road2, state = environment_initialization()

    for steps in range( 20000 ):
        if num_cars_road1 > 10 or num_cars_road2 > 10:
            num_cars_road1, num_cars_road2, state = environment_initialization()

        if np.random.random() < 0.25:
            num_cars_road1 += 1

        if np.random.random() < 0.25:
            num_cars_road2 += 1

        obs = np.array( [ num_cars_road1, num_cars_road2, state ] )
        act = ReinforceLearn.select_act( obs )

        if act == 0:  #modify state
            if state == 0:
                state = 2
            elif state == 1:
                state = 3
            elif state == 2:
                state = 1
                if num_cars_road2 > 0:
                    num_cars_road2 -= 1
            elif state == 3:
                state = 0
                if num_cars_road1 > 0:
                    num_cars_road1 -= 1
        
        elif act == 1:  #continue
            if state == 0:
                if num_cars_road1 > 0:
                    num_cars_road1 -= 1
            elif state == 1:
                if num_cars_road2 > 0:
                    num_cars_road2 -= 1
        
        else:
            print( "act error!" )

        reward =-( num_cars_road1 ** 2 + num_cars_road2 ** 2 )
        obs_ = np.array( [ num_cars_road1, num_cars_road2, state ] )
        ReinforceLearn.store_progression( obs, act, reward, obs_ )

        if steps > 200:
            ReinforceLearn.learn()

        if steps%50 == 0:
            print( reward )
            
        reward_set.append( reward )
        step_set.append( steps )
        obs = obs_
    
    plt.plot( step_set, reward_set )
    plt.savefig( 'training.png' )
    #ReinforceLearn.store()
    plt.show()
    ReinforceLearn.cost_plotting()

if args.test:
    ReinforceLearn = DQN( number_act = 2,number_feature = 3, 
                learn_ratio = 0.01,e_greedy = 1., 
                change_target_iteration = 100,mem_size = 2000, 
                e_greedy_increment = None, )

    step_set = []
    reward_set = []
    num_cars_road1, num_cars_road2, state = environment_initialization()
    #ReinforceLearn.restore()

    for steps in range( 1000 ):
        if num_cars_road1 > 10 or num_cars_road2 > 10:
            num_cars_road1, num_cars_road2, state = environment_initialization()

        if np.random.random() < 0.25:
            num_cars_road1 += 1

        if np.random.random() < 0.25:
            num_cars_road2 += 1

        obs = np.array( [ num_cars_road1, num_cars_road2, state ] )
        act = ReinforceLearn.select_act( obs )
        print( obs, act )

        if act  == 0:  #modify state
            if state == 0:
                state = 2
            elif state == 1:
                state = 3
            elif state == 2:
                state = 1
                if num_cars_road2 > 0:
                    num_cars_road2 -= 1
            elif state == 3:
                state = 0
                if num_cars_road1 > 0:
                    num_cars_road1 -= 1
        elif act == 1:  #continue
            if state == 0:
                if num_cars_road1 > 0:
                    num_cars_road1 -= 1
            elif state == 1:
                if num_cars_road2 > 0:
                    num_cars_road2 -= 1

        else:
            print( "act error!" )
        reward =-( num_cars_road1 ** 2 + num_cars_road2 ** 2 )
        obs_ = [ num_cars_road1, num_cars_road2, state ]

        if steps%50 == 0:
            print( reward )
        
        obs = obs_
        steps += 1
        reward_set.append( reward )
        step_set.append( steps )

    plt.plot( step_set, reward_set )
    plt.savefig( 'testing.png' )
    plt.show()
